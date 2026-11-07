import { isAdmin } from "@/lib/auth";
import { listOrders, getOrder, saveOrder, markPaid } from "@/lib/db";

export const dynamic = "force-dynamic";
const STATUSES = ["Awaiting payment", "Paid", "Packed", "Out for delivery", "Delivered", "Cancelled"];

export async function GET() {
  if (!isAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const orders = await listOrders();
  return Response.json({ orders });
}

export async function PATCH(req) {
  if (!isAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { id, status } = await req.json();
  if (!STATUSES.includes(status)) return Response.json({ error: "Unknown status" }, { status: 400 });
  let order = await getOrder(id);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (["Paid", "Packed", "Out for delivery", "Delivered"].includes(status) && !order.paidAt) order = await markPaid(id);
  order.status = status;
  await saveOrder(order);
  return Response.json({ order });
}
