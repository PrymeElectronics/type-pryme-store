"use client";
import { useState } from "react";
import { Smartphone, Cable, Lightbulb, Package } from "lucide-react";

const ICONS = { Phones: Smartphone, Cables: Cable, Lights: Lightbulb };

export default function ProductImage({ product, className = "" }) {
  const [broken, setBroken] = useState(!product.image);
  const Icon = ICONS[product.category] || Package;
  if (broken)
    return (
      <div className={`pimg pimg-fallback ${className}`} data-cat={product.category} aria-label={product.name} role="img">
        <Icon size={80} strokeWidth={1.1} />
      </div>
    );
  return <img className={`pimg ${className}`} src={product.image} alt={product.name} onError={() => setBroken(true)} />;
}
