import { Redis } from "@upstash/redis";
import { SEED_PRODUCTS } from "./products";

let client;
export function redis() {
  if (!client) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error("DB_NOT_CONNECTED");
    client = new Redis({ url, token });
  }
  return client;
}

export async function getProducts() {
  let products = await redis().get("products");
  if (!products) {
    products = SEED_PRODUCTS;
    await redis().set("products", products);
  }
  return products;
}

export async function saveProducts(products) {
  await redis().set("products", products);
}

export async function nextOrderId() {
  const n = await redis().incr("order_seq");
  return "PE" + (1000 + n);
}

export async function createOrder(order) {
  await redis().set(`order:${order.id}`, order);
  await redis().lpush("orders", order.id);
}

export async function getOrder(id) {
  return redis().get(`order:${id}`);
}

export async function saveOrder(order) {
  await redis().set(`order:${order.id}`, order);
}

export async function listOrders() {
  const ids = await redis().lrange("orders", 0, 999);
  if (!ids.length) return [];
  const orders = await redis().mget(...ids.map((id) => `order:${id}`));
  return orders.filter(Boolean);
}

// Marks an order paid once, and takes the items out of stock.
export async function markPaid(id, paymentId) {
  const order = await getOrder(id);
  if (!order) return null;
  if (order.paidAt) return order;
  order.status = "Paid";
  order.paidAt = new Date().toISOString();
  if (paymentId) order.paymentId = paymentId;
  await saveOrder(order);
  const products = await getProducts();
  await saveProducts(
    products.map((p) => {
      const line = order.items.find((i) => i.id === p.id);
      return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
    })
  );
  return order;
}
