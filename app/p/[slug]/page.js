import { notFound } from "next/navigation";
import { getProducts } from "@/lib/db";
import { STORE } from "@/lib/products";
import ProductPage from "@/components/ProductPage";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  try {
    const p = (await getProducts()).find((x) => x.id === params.slug);
    if (p) return { title: `${p.name} | ${STORE.name}`, description: p.hook };
  } catch {}
  return { title: STORE.name };
}

export default async function Page({ params }) {
  let products;
  try { products = await getProducts(); } catch { return <SetupNotice />; }
  const product = products.find((x) => x.id === params.slug && x.active !== false);
  if (!product) notFound();
  return <ProductPage product={product} products={products} store={STORE} whatsapp={process.env.NEXT_PUBLIC_WHATSAPP || ""} />;
}
