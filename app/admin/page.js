"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { rand } from "@/lib/format";

const STATUSES = ["Awaiting payment", "Paid", "Packed", "Out for delivery", "Delivered", "Cancelled"];
const PAID = ["Paid", "Packed", "Out for delivery", "Delivered"];
const waNum = (phone) => String(phone || "").replace(/\D/g, "").replace(/^0/, "27");

export default function Admin() {
  const [state, setState] = useState("loading");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("orders");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/admin/orders", { cache: "no-store" });
    if (r.status === 401) return setState("login");
    const d = await r.json();
    setOrders(d.orders || []);
    const p = await fetch("/api/admin/products", { cache: "no-store" }).then((x) => x.json());
    setProducts(p.products || []);
    setState("ready");
  }
  useEffect(() => { load(); }, []);

  async function login(e) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (!r.ok) return setMsg((await r.json()).error || "Couldn't sign in.");
    setMsg(""); load();
  }

  if (state === "loading") return <main className="admin"><p>Loading…</p></main>;
  if (state === "login")
    return (
      <main className="admin login">
        <form onSubmit={login} className="card">
          <h1>Store dashboard</h1>
          <label>Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
          {msg && <p className="err">{msg}</p>}
          <button className="btn btn-ink btn-block">Open dashboard</button>
        </form>
      </main>
    );

  return (
    <main className="admin">
      <div className="admin-head">
        <h1>Dashboard</h1>
        <nav className="tabs">
          {[["overview", "Overview"], ["orders", "Orders"], ["clients", "Clients"], ["products", "Products"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
          <Link href="/" className="tab-link">View store</Link>
        </nav>
      </div>
      {tab === "overview" && <Overview orders={orders} products={products} go={setTab} />}
      {tab === "orders" && <Orders orders={orders} setOrders={setOrders} reload={load} />}
      {tab === "clients" && <Clients orders={orders} />}
      {tab === "products" && <Products products={products} setProducts={setProducts} />}
    </main>
  );
}

function Overview({ orders, products, go }) {
  const paid = orders.filter((o) => PAID.includes(o.status));
  const today = new Date().toDateString();
  const stats = [
    ["Sales (paid)", rand(paid.reduce((a, o) => a + o.total, 0)), "orders"],
    ["Paid today", paid.filter((o) => new Date(o.paidAt || o.createdAt).toDateString() === today).length, "orders"],
    ["To pack and send", orders.filter((o) => o.status === "Paid" || o.status === "Packed").length, "orders"],
    ["Clients", new Set(orders.map((o) => waNum(o.customer.phone))).size, "clients"],
  ];
  return (
    <>
      <div className="stats">{stats.map(([l, v, t]) => <button key={l} className="card stat" onClick={() => go(t)}><span>{l}</span><strong>{v}</strong></button>)}</div>
      <div className="card">
        <h2>Stock</h2>
        {products.map((p) => (
          <div key={p.id} className="row"><span>{p.name}</span><strong className={p.stock <= 3 ? "warn" : ""}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</strong></div>
        ))}
      </div>
    </>
  );
}

function Orders({ orders, setOrders, reload }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const list = orders.filter((o) => filter === "All" || o.status === filter);

  async function setStatus(id, status) {
    const r = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const d = await r.json();
    if (d.order) setOrders((os) => os.map((o) => (o.id === id ? d.order : o)));
  }

  return (
    <>
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter orders">
          {["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-line" onClick={reload}>Refresh</button>
      </div>
      {list.length === 0 && <p className="muted">No orders here yet. Once your TikTok goes out, they'll land here.</p>}
      {list.map((o) => (
        <div key={o.id} className="card order">
          <button className="order-top" onClick={() => setOpen(open === o.id ? null : o.id)}>
            <strong>{o.id}</strong>
            <span className="grow">{o.customer.name}</span>
            <span>{rand(o.total)}</span>
            <span className={`pill s-${o.status.replace(/\s/g, "-").toLowerCase()}`}>{o.status}</span>
          </button>
          {open === o.id && (
            <div className="order-body">
              <div>
                <p className="muted">{new Date(o.createdAt).toLocaleString("en-ZA")}</p>
                <p><a href={`https://wa.me/${waNum(o.customer.phone)}?text=${encodeURIComponent(`Hi ${o.customer.name.split(" ")[0]}, it's Pryme about your order ${o.id}.`)}`} target="_blank" rel="noreferrer">{o.customer.phone} (WhatsApp)</a></p>
                {o.customer.email && <p>{o.customer.email}</p>}
                <p>{o.customer.address}{o.customer.suburb ? `, ${o.customer.suburb}` : ""}</p>
                {o.customer.notes && <p className="muted">Note: {o.customer.notes}</p>}
              </div>
              <div>
                {o.items.map((l) => <div key={l.id} className="row"><span>{l.name} × {l.qty}</span><span>{rand(l.price * l.qty)}</span></div>)}
                <div className="row muted"><span>Delivery</span><span>{o.delivery ? rand(o.delivery) : "Free"}</span></div>
                <div className="row total"><span>Total</span><span>{rand(o.total)}</span></div>
                <label>Status
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function Clients({ orders }) {
  const clients = useMemo(() => {
    const m = {};
    orders.forEach((o) => {
      const k = waNum(o.customer.phone) || o.customer.name;
      m[k] ||= { key: k, ...o.customer, count: 0, spent: 0, last: o.createdAt };
      m[k].count++;
      if (PAID.includes(o.status)) m[k].spent += o.total;
      if (o.createdAt > m[k].last) m[k].last = o.createdAt;
    });
    return Object.values(m).sort((a, b) => b.spent - a.spent);
  }, [orders]);
  if (!clients.length) return <p className="muted">Clients appear here after their first order.</p>;
  return (
    <div className="card">
      {clients.map((c) => (
        <div key={c.key} className="client">
          <div className="grow"><strong>{c.name}</strong><span className="muted">{c.suburb || c.address}</span></div>
          <div className="right"><strong>{rand(c.spent)}</strong><span className="muted">{c.count} order{c.count > 1 ? "s" : ""}</span></div>
          <a className="btn btn-line" href={`https://wa.me/${waNum(c.phone)}`} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      ))}
    </div>
  );
}

function Products({ products, setProducts }) {
  const [draft, setDraft] = useState(products.map((p) => ({ ...p, bullets: p.bullets.join("\n") })));
  const [saved, setSaved] = useState("");
  const set = (i, k, v) => { setDraft((d) => d.map((p, n) => (n === i ? { ...p, [k]: v } : p))); setSaved(""); };
  const addNew = () => setDraft((d) => [...d, { id: "new-product-" + (d.length + 1), name: "", category: "Phones", badge: "", hook: "", bullets: "", price: 0, compareAt: null, stock: 0, image: "", active: false }]);

  async function save() {
    const r = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products: draft }) });
    const d = await r.json();
    if (d.products) { setProducts(d.products); setDraft(d.products.map((p) => ({ ...p, bullets: p.bullets.join("\n") }))); setSaved("Products saved. The store is updated."); }
    else setSaved(d.error || "Couldn't save.");
  }

  return (
    <>
      {draft.map((p, i) => (
        <div key={i} className="card pform">
          <div className="two">
            <label>Name<input value={p.name} onChange={(e) => set(i, "name", e.target.value)} /></label>
            <label>Web address (/p/…)<input value={p.id} onChange={(e) => set(i, "id", e.target.value)} /></label>
          </div>
          <div className="four">
            <label>Price (R)<input inputMode="numeric" value={p.price} onChange={(e) => set(i, "price", e.target.value)} /></label>
            <label>Was price (R)<input inputMode="numeric" value={p.compareAt || ""} onChange={(e) => set(i, "compareAt", e.target.value)} placeholder="Optional" /></label>
            <label>Stock<input inputMode="numeric" value={p.stock} onChange={(e) => set(i, "stock", e.target.value)} /></label>
            <label>Category<select value={p.category} onChange={(e) => set(i, "category", e.target.value)}>{["Phones", "Cables", "Lights", "Chargers", "Audio", "Accessories"].map((c) => <option key={c}>{c}</option>)}</select></label>
          </div>
          <div className="two">
            <label>Headline<input value={p.hook} onChange={(e) => set(i, "hook", e.target.value)} /></label>
            <label>Badge<input value={p.badge || ""} onChange={(e) => set(i, "badge", e.target.value)} placeholder="e.g. Just landed" /></label>
          </div>
          <label>Selling points (one per line)<textarea rows={4} value={p.bullets} onChange={(e) => set(i, "bullets", e.target.value)} /></label>
          <label>Photo link<input value={p.image} onChange={(e) => set(i, "image", e.target.value)} placeholder="/products/photo.jpg or https://…" /></label>
          <label className="check"><input type="checkbox" checked={p.active !== false} onChange={(e) => set(i, "active", e.target.checked)} />Show in store</label>
        </div>
      ))}
      <div className="toolbar">
        <button className="btn btn-line" onClick={addNew}>Add product</button>
        <button className="btn btn-ink" onClick={save}>Save products</button>
        {saved && <span className="ok">{saved}</span>}
      </div>
    </>
  );
}
