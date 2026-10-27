import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { ProductCard } from "@/components/product-card";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/catalog")({ component: Catalog });

function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("The catalog could not be loaded. Refresh in a moment."));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((item) => item.category)))],
    [products],
  );
  const shown = category === "All" ? products : products.filter((item) => item.category === category);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Catalog</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Pieces we can repeat.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Prices are not listed. Add quantities to an inquiry and we return a quotation for the lot.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={
                item === category
                  ? "bg-ink px-4 py-2 text-sm text-canvas"
                  : "border border-line px-4 py-2 text-sm text-muted"
              }
            >
              {item}
            </button>
          ))}
        </div>
        {error ? <p className="mt-8 text-sm text-wood">{error}</p> : null}
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
