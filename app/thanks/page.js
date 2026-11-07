import Link from "next/link";
import { getOrder } from "@/lib/db";
import { STORE } from "@/lib/products";
import { rand, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Thanks({ searchParams }) {
  let order = null;
  try { if (searchParams?.order) order = await getOrder(String(searchParams.order)); } catch {}
  const first = order?.customer?.name?.split(" ")[0];
  const wa = waLink(process.env.NEXT_PUBLIC_WHATSAPP, `Hi ${STORE.name}, checking on my order ${order?.id || ""}.`);
  return (
    <main className="thanks">
      <h1>{first ? `Sharp, ${first}.` : "Thank you."}</h1>
      {order ? (
        <>
          <p className="hook">Order {order.id} is in. {order.status === "Awaiting payment" ? "We're confirming your payment now." : "Payment received."}</p>
          <div className="summary">
            {order.items.map((l) => <div key={l.id} className="row"><span>{l.name} × {l.qty}</span><span>{rand(l.price * l.qty)}</span></div>)}
            <div className="row total"><span>Total</span><span>{rand(order.total)}</span></div>
          </div>
          <p>We'll WhatsApp you on {order.customer.phone} when it's on the way. Delivery takes {STORE.deliveryTime}.</p>
        </>
      ) : (
        <p className="hook">Your order is in. We'll WhatsApp you when it's on the way.</p>
      )}
      <div className="actions">
        <Link className="btn btn-ink" href="/">Back to the shop</Link>
        {wa && <a className="btn btn-line" href={wa} target="_blank" rel="noreferrer">WhatsApp us</a>}
      </div>
    </main>
  );
}
