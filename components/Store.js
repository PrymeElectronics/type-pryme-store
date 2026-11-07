"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, MessageCircle, ShieldCheck, Truck, PackageCheck, Check } from "lucide-react";
import ProductImage from "./ProductImage";
import CheckoutSheet from "./CheckoutSheet";
import Stock from "./Stock";
import { rand, deliveryFor, waLink } from "@/lib/format";

const PROBLEMS = ["Phone dead?", "Yard dark?", "Cable gone?"];
const TRUST_ICON = { box: PackageCheck, shield: ShieldCheck, truck: Truck, chat: MessageCircle };

export default function Store({ products, store, whatsapp }) {
  const live = products.filter((p) => p.active !== false);
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [added, setAdded] = useState(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    try { const s = localStorage.getItem("pe_bag"); if (s) setBag(JSON.parse(s)); } catch {}
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % PROBLEMS.length), 2000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { try { localStorage.setItem("pe_bag", JSON.stringify(bag)); } catch {} }, [bag]);

  const count = bag.reduce((a, b) => a + b.qty, 0);
  const subtotal = bag.reduce((a, b) => a + (live.find((p) => p.id === b.id)?.price || 0) * b.qty, 0);
  const delivery = deliveryFor(subtotal, store);
  const toFree = store.freeDeliveryOver > 0 ? store.freeDeliveryOver - subtotal : 0;

  const add = (p) => {
    setBag((b) => {
      const ex = b.find((x) => x.id === p.id);
      if (ex) return b.map((x) => (x.id === p.id ? { ...x, qty: Math.min(p.stock, x.qty + 1) } : x));
      return [...b, { id: p.id, qty: 1 }];
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1400);
  };
  const setQty = (id, qty) =>
    setBag((b) => (qty <= 0 ? b.filter((x) => x.id !== id) : b.map((x) => (x.id === id ? { ...x, qty: Math.min(qty, live.find((p) => p.id === id)?.stock || qty) } : x))));

  const wa = waLink(whatsapp, `Hi ${store.name}, I have a question about your products.`);

  return (
    <>
      {store.freeDeliveryOver > 0 && (
        <div className="topbar">Free delivery in {store.deliveryArea} on orders over {rand(store.freeDeliveryOver)}</div>
      )}
      <header className="nav">
        <Link href="/" className="logo">{store.name}</Link>
        <button className="bag-btn" onClick={() => setBagOpen(true)} aria-label={`Bag, ${count} items`}>
          <ShoppingBag size={22} />
          {count > 0 && <span className="bag-count">{count}</span>}
        </button>
      </header>

      <section className="hero">
        <h1>
          <span className="problem" key={i}>{PROBLEMS[i]}</span>
          <span className="sorted">Sorted.</span>
        </h1>
        <p className="hero-sub">Phones, chargers and lights that just work, at prices that make sense. Order in a minute, delivered to your door.</p>
        <a href="#shop" className="btn btn-ink">See what's in stock</a>
      </section>

      <main id="shop" className="shop">
        {live.map((p, idx) => (
          <article key={p.id} className={`feature ${idx % 2 ? "flip" : ""}`}>
            <Link href={`/p/${p.id}`} className="feature-art" data-cat={p.category}>
              {p.badge && <span className="badge">{p.badge}</span>}
              <ProductImage product={p} />
            </Link>
            <div className="feature-body">
              <p className="cat">{p.category}</p>
              <h2><Link href={`/p/${p.id}`}>{p.name}</Link></h2>
              <p className="hook">{p.hook}</p>
              <ul className="bullets">{p.bullets.map((b) => <li key={b}><Check size={18} />{b}</li>)}</ul>
              <div className="price-row">
                <span className="price">{rand(p.price)}</span>
                {p.compareAt > p.price && <span className="was">{rand(p.compareAt)}</span>}
              </div>
              <Stock stock={p.stock} />
              <div className="actions">
                <button className="btn btn-sun" disabled={p.stock <= 0} onClick={() => setCheckout([{ id: p.id, qty: 1 }])}>Buy now</button>
                <button className="btn btn-line" disabled={p.stock <= 0} onClick={() => add(p)}>
                  {added === p.id ? <><Check size={18} />Added</> : <><Plus size={18} />Add to bag</>}
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>

      <section className="trust">
        {store.trust.map((t) => {
          const Icon = TRUST_ICON[t.icon] || Check;
          return <div key={t.title} className="trust-item"><Icon size={26} /><h3>{t.title}</h3><p>{t.text}</p></div>;
        })}
      </section>

      <section className="steps">
        <h2>Buying takes about a minute</h2>
        <ol>
          <li><strong>Tap Buy now</strong><span>Pick your item and add your address.</span></li>
          <li><strong>Pay safely</strong><span>Card payment on Whop's secure checkout.</span></li>
          <li><strong>We deliver</strong><span>At your door in {store.deliveryTime}. We WhatsApp you on the way.</span></li>
        </ol>
      </section>

      <footer className="foot">
        <span>{store.name}</span>
        {wa && <a href={wa} target="_blank" rel="noreferrer">WhatsApp us</a>}
      </footer>

      {wa && (
        <a className="wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={28} /></a>
      )}

      {bagOpen && (
        <div className="overlay right" onClick={() => setBagOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head"><h2>Your bag</h2><button className="icon-btn" onClick={() => setBagOpen(false)} aria-label="Close"><X /></button></div>
            {bag.length === 0 ? (
              <p className="muted">Nothing in here yet. The A07 is a good place to start.</p>
            ) : (
              <>
                <div className="bag-lines">
                  {bag.map((b) => {
                    const p = live.find((x) => x.id === b.id);
                    if (!p) return null;
                    return (
                      <div key={b.id} className="bag-line">
                        <div className="thumb" data-cat={p.category}><ProductImage product={p} /></div>
                        <div className="grow">
                          <strong>{p.name}</strong>
                          <span className="muted">{rand(p.price)}</span>
                          <div className="qty">
                            <button onClick={() => setQty(b.id, b.qty - 1)} aria-label="One less"><Minus size={16} /></button>
                            <span>{b.qty}</span>
                            <button onClick={() => setQty(b.id, b.qty + 1)} aria-label="One more"><Plus size={16} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {toFree > 0 && <p className="nudge">Add {rand(toFree)} more for free delivery</p>}
                <div className="summary">
                  <div className="row"><span>Subtotal</span><span>{rand(subtotal)}</span></div>
                  <div className="row muted"><span>Delivery</span><span>{delivery === 0 ? "Free" : rand(delivery)}</span></div>
                  <div className="row total"><span>Total</span><span>{rand(subtotal + delivery)}</span></div>
                </div>
                <button className="btn btn-sun btn-block" onClick={() => { setBagOpen(false); setCheckout(bag); }}>Check out</button>
              </>
            )}
          </aside>
        </div>
      )}

      {checkout && (
        <CheckoutSheet items={checkout} products={live} store={store} whatsapp={whatsapp}
          onClose={() => setCheckout(null)} onPaid={() => checkout === bag && setBag([])} />
      )}
    </>
  );
}
