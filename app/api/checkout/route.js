import { getProducts, nextOrderId, createOrder, saveOrder } from "@/lib/db";
import { STORE } from "@/lib/products";
import { deliveryFor } from "@/lib/format";

export const dynamic = "force-dynamic";
const fail = (msg, status = 400) => Response.json({ error: msg }, { status });

export async function POST(req) {
  try {
    const { items, customer } = await req.json();
    const c = {
      name: String(customer?.name || "").trim().slice(0, 80),
      phone: String(customer?.phone || "").trim().slice(0, 30),
      email: String(customer?.email || "").trim().slice(0, 120),
      address: String(customer?.address || "").trim().slice(0, 200),
      suburb: String(customer?.suburb || "").trim().slice(0, 120),
      notes: String(customer?.notes || "").trim().slice(0, 300),
    };
    if (!c.name || !c.phone || !c.address) return fail("Add your name, phone number and delivery address.");
    if (!Array.isArray(items) || !items.length) return fail("Your bag is empty.");

    // Prices always come from the database, never from the browser.
    const products = await getProducts();
    const lines = [];
    for (const it of items) {
      const p = products.find((x) => x.id === it.id && x.active !== false);
      if (!p) return fail("One of the items is no longer available. Refresh the page.");
      const qty = Math.max(1, Math.min(Number(it.qty) || 1, 10));
      if (p.stock < qty) return fail(p.stock === 0 ? `${p.name} just sold out.` : `Only ${p.stock} ${p.name} left.`);
      lines.push({ id: p.id, name: p.name, price: p.price, qty });
    }
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const delivery = deliveryFor(subtotal, STORE);
    const total = subtotal + delivery;

    const id = await nextOrderId();
    const order = {
      id, createdAt: new Date().toISOString(), status: "Awaiting payment",
      customer: c, items: lines, subtotal, delivery, total,
    };
    await createOrder(order);

    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const summary = lines.map((l) => `${l.name} x${l.qty}`).join(", ");
    const res = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: {
          company_id: process.env.WHOP_COMPANY_ID,
          currency: process.env.WHOP_CURRENCY || "zar",
          plan_type: "one_time",
          initial_price: total,
          title: `Order ${id}`,
          description: summary.slice(0, 250),
          visibility: "hidden",
          product: { external_identifier: "pryme-store-orders", title: `${STORE.name} order`, visibility: "hidden" },
        },
        metadata: { order_id: id },
        redirect_url: `${site}/thanks?order=${id}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.purchase_url) {
      console.error("Whop checkout error", res.status, JSON.stringify(data));
      return fail("Card payment couldn't start right now. Tap 'Order on WhatsApp' instead and we'll sort you out.", 502);
    }
    const url = data.purchase_url.startsWith("http") ? data.purchase_url : `https://whop.com${data.purchase_url}`;
    order.whopCheckoutId = data.id;
    await saveOrder(order);
    return Response.json({ url, orderId: id });
  } catch (e) {
    console.error(e);
    return fail(e.message === "DB_NOT_CONNECTED" ? "Store database isn't connected yet." : "Something went wrong. Try again.", 500);
  }
}
