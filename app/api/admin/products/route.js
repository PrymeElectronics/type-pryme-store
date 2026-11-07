import { isAdmin } from "@/lib/auth";
import { getProducts, saveProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  return Response.json({ products: await getProducts() });
}

export async function PUT(req) {
  if (!isAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { products } = await req.json();
  if (!Array.isArray(products)) return Response.json({ error: "Bad data" }, { status: 400 });
  const clean = products.map((p) => ({
    ...p,
    id: String(p.id).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    price: Number(p.price) || 0,
    compareAt: p.compareAt ? Number(p.compareAt) : null,
    stock: Math.max(0, parseInt(p.stock, 10) || 0),
    bullets: (Array.isArray(p.bullets) ? p.bullets : String(p.bullets || "").split("\n")).map((b) => b.trim()).filter(Boolean),
    active: p.active !== false,
  }));
  await saveProducts(clean);
  return Response.json({ products: clean });
}
