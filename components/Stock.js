export default function Stock({ stock }) {
  if (stock <= 0) return <p className="stock stock-out">Sold out. WhatsApp us to get on the next batch.</p>;
  if (stock <= 5) return <p className="stock stock-low">Only {stock} left in this batch</p>;
  return <p className="stock">In stock, ready to deliver</p>;
}
