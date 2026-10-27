import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { ProductCard } from "@/components/product-card";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  return (
    <Shell>
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Mango wood · Wholesale</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
            Timber, made with a quiet hand.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            HS Timber Works supplies chairs, tables, cabinets, toys, and commissioned pieces to
            retailers and organisations. You choose from the catalog or describe what you need. We
            quote, make, and deliver.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalog" className="bg-ink px-5 py-3 text-sm text-canvas">
              View the catalog
            </Link>
            <Link to="/custom" className="border border-ink px-5 py-3 text-sm">
              Describe a custom order
            </Link>
          </div>
        </div>
        <img src="/media/hero.jpg" alt="Showroom of mango wood furniture" className="aspect-[16/10] w-full object-cover" />
      </section>

      <section className="border-y border-line">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3">
          {[
            ["Catalog or brief", "Select finished pieces, or send a drawing for an organisation."],
            ["A written quotation", "We reply with timber, finish, quantity, and lead time."],
            ["Made, then delivered", "Production happens in our workshop. You receive the order."],
          ].map(([title, copy]) => (
            <div key={title} className="border-line px-5 py-8 md:border-r md:last:border-r-0">
              <h2 className="font-serif text-2xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl">From the floor</h2>
          <Link to="/catalog" className="text-sm text-muted">
            All pieces
          </Link>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-20 md:grid-cols-2">
        <img src="/media/workshop.jpg" alt="Stacked timber in the workshop" className="aspect-square object-cover" />
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">The workshop</p>
          <h2 className="mt-3 font-serif text-4xl">Mango, first. Other woods when the job asks.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Most of what we make begins as mango — stable, warm, and honest in grain. Institutional
            runs, shop fittings, and one-off commissions are quoted from the same bench.
          </p>
          <Link to="/about" className="mt-6 inline-block border border-ink px-5 py-3 text-sm">
            How we work
          </Link>
        </div>
      </section>
    </Shell>
  );
}
