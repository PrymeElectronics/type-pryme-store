export const rand = (n) => "R" + Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function deliveryFor(subtotal, store) {
  if (subtotal <= 0) return 0;
  if (store.freeDeliveryOver > 0 && subtotal >= store.freeDeliveryOver) return 0;
  return store.deliveryFee;
}

export function waLink(number, text) {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
