"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ArrowLeft, MessageCircle } from "lucide-react";
import ProductImage from "./ProductImage";
import CheckoutSheet from "./CheckoutSheet";
import Stock from "./Stock";
import { rand, waLink } from "@/lib/format";

export default function ProductPage({ product: p, products, store, whatsapp }) {
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const others = products.filter((x) => x.id !== p.id && x.active !== false);
  const wa = waLink(whatsapp, `Hi ${store.name}, is the ${p.name} still available?`);

  return (
    <>
      <header className="nav">
        <Link href="/" className="logo">{store.name}</Link>
        <Link href="/" className="back"><ArrowLeft size={18} />All products</Link>
      </header>

      <main className="pdp">
        <div className="pdp-art" data-cat={p.category}>
          {p.badge && <span className="badge">{p.badge}</span>}
          <ProductImage product={p} />
        </div>
        <div className="pdp-body">
          <p className="cat">{p.category}</p>
          <h1>{p.name}</h1>
          <p className="hook">{p.hook}</p>
          <div className="price-row">
            <span className="price">{rand(p.price)}</span>
            {p.compareAt > p.price && <span className="was">{rand(p.compareAt)}</span>}
          </div>
          <Stock stock={p.stock} />
          <ul className="bullets">{p.bullets.map((b) => <li key={b}><Check size={18} />{b}</li>)}</ul>
          {p.stock > 1 && (
            <label className="qty-select">How many?
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {Array.from({ length: Math.min(p.stock, 5) }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          )}
          <div className="actions">
            <button className="btn btn-sun btn-big" disabled={p.stock <= 0} onClick={() => setOpen(true)}>Buy now for {rand(p.price * qty)}</button>
          </div>
          {wa && <a className="ask" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} />Got a question? WhatsApp us</a>}
          <ul className="mini-trust">
            {store.trust.slice(0, 3).map((t) => <li key={t.title}><Check size={16} />{t.title}</li>)}
          </ul>
        </div>
      </main>

      {others.length > 0 && (
        <section className="also">
          <h2>Goes well with</h2>
          <div className="also-grid">
            {others.map((o) => (
              <Link key={o.id} href={`/p/${o.id}`} className="also-card">
                <div className="also-art" data-cat={o.category}><ProductImage product={o} /></div>
                <strong>{o.name}</strong><span>{rand(o.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="sticky-buy">
        <span><strong>{rand(p.price * qty)}</strong><small>{p.name}</small></span>
        <button className="btn btn-sun" disabled={p.stock <= 0} onClick={() => setOpen(true)}>Buy now</button>
      </div>

      {open && <CheckoutSheet items={[{ id: p.id, qty }]} products={products} store={store} whatsapp={whatsapp} onClose={() => setOpen(false)} />}
    </>
  );
}
