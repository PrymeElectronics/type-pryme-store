"use client";
import { useState } from "react";
import { X, Lock, MessageCircle } from "lucide-react";
import { rand, deliveryFor, waLink } from "@/lib/format";

export default function CheckoutSheet({ items, products, store, whatsapp, onClose, onPaid }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", suburb: "", notes: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const lines = items.map((i) => ({ ...i, p: products.find((p) => p.id === i.id) })).filter((l) => l.p);
  const subtotal = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const delivery = deliveryFor(subtotal, store);
  const total = subtotal + delivery;

  const waText = `Hi ${store.name}, I'd like to order:\n${lines.map((l) => `- ${l.p.name} x${l.qty}`).join("\n")}\nTotal: ${rand(total)}${f.name ? `\nName: ${f.name}` : ""}${f.address ? `\nDeliver to: ${f.address}, ${f.suburb}` : ""}`;
  const wa = waLink(whatsapp, waText);

  async function pay(e) {
    e.preventDefault();
    setErr("");
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim()) return setErr("Add your name, phone number and delivery address.");
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(({ id, qty }) => ({ id, qty })), customer: f }),
      });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "Payment couldn't start. Try again.");
      onPaid?.();
      window.location.href = d.url;
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={pay}>
        <div className="sheet-head">
          <h2>Where must we deliver?</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <div className="summary">
          {lines.map((l) => (
            <div key={l.id} className="row"><span>{l.p.name} × {l.qty}</span><span>{rand(l.p.price * l.qty)}</span></div>
          ))}
          <div className="row muted"><span>Delivery</span><span>{delivery === 0 ? "Free" : rand(delivery)}</span></div>
          <div className="row total"><span>Total</span><span>{rand(total)}</span></div>
        </div>

        <label>Full name<input value={f.name} onChange={set("name")} autoComplete="name" required /></label>
        <div className="two">
          <label>WhatsApp number<input value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" required /></label>
          <label>Email<input value={f.email} onChange={set("email")} inputMode="email" autoComplete="email" /></label>
        </div>
        <label>Street address<input value={f.address} onChange={set("address")} autoComplete="street-address" required /></label>
        <label>Suburb and city<input value={f.suburb} onChange={set("suburb")} /></label>
        <label>Anything we should know? (optional)<input value={f.notes} onChange={set("notes")} placeholder="Gate code, best time to deliver" /></label>

        {err && <p className="err">{err}</p>}
        <button className="btn btn-sun btn-block" disabled={busy}>
          <Lock size={18} />{busy ? "Opening secure checkout…" : `Pay ${rand(total)} securely`}
        </button>
        <p className="fine">You'll pay on Whop's secure checkout, then come straight back here.</p>
        {wa && (
          <a className="btn btn-wa btn-block" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} />Rather order on WhatsApp</a>
        )}
      </form>
    </div>
  );
}
