import { markPaid } from "@/lib/db";

export const dynamic = "force-dynamic";

// Whop calls this when a payment succeeds. We don't trust the message itself:
// we ask Whop directly for the payment and only mark the order paid if Whop confirms it.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const type = String(body?.type || body?.action || "");
    const paymentId = body?.data?.id;
    if (!type.includes("payment") || !paymentId) return Response.json({ ok: true });

    const r = await fetch(`https://api.whop.com/api/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
    });
    const payment = await r.json().catch(() => ({}));
    const orderId = payment?.metadata?.order_id;
    if (r.ok && payment?.status === "paid" && orderId) await markPaid(orderId, payment.id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Webhook error", e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
