import { getProducts } from "@/lib/db";
import { STORE } from "@/lib/products";
import Store from "@/components/Store";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products;
  try { products = await getProducts(); } catch { return <SetupNotice />; }
  return <Store products={products} store={STORE} whatsapp={process.env.NEXT_PUBLIC_WHATSAPP || ""} />;
}
