import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/products/$id" params={{ id: String(product.id) }} className="group block">
      <div className="aspect-square overflow-hidden bg-surface">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl">{product.name}</h3>
        <span className="text-xs tracking-wide text-muted">{product.sku}</span>
      </div>
      <p className="mt-1 text-sm text-muted">{product.summary}</p>
    </Link>
  );
}
