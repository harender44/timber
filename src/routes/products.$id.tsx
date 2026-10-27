import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { fetchProduct } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/products/$id")({ component: ProductPage });

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [missing, setMissing] = useState(false);
  const add = useCart((s) => s.add);

  useEffect(() => {
    fetchProduct(id)
      .then((item) => {
        setProduct(item);
        setPhoto(0);
      })
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <Shell>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p>That piece is no longer listed.</p>
          <Link to="/catalog" className="mt-4 inline-block text-sm text-muted">
            Return to the catalog
          </Link>
        </div>
      </Shell>
    );
  }

  if (!product) {
    return (
      <Shell>
        <div className="mx-auto max-w-6xl px-5 py-20 text-sm text-muted">Loading the piece…</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2">
        <div>
          <img
            src={product.images[photo] ?? product.images[0]}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
          <div className="mt-3 flex gap-3">
            {product.images.map((src, index) => (
              <button key={src} type="button" onClick={() => setPhoto(index)} className="w-20">
                <img
                  src={src}
                  alt=""
                  className={index === photo ? "aspect-square object-cover outline outline-ink" : "aspect-square object-cover opacity-70"}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">
            {product.category} · {product.wood}
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">{product.sku}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted">{product.description}</p>
          <label className="mt-8 block text-sm">
            Quantity
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
              className="mt-2 w-28 border border-line bg-canvas px-3 py-3"
            />
          </label>
          <label className="mt-4 block text-sm">
            Notes for this piece
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Finish, size, or packing preference"
              className="mt-2 w-full border border-line bg-canvas px-3 py-3"
            />
          </label>
          <button
            type="button"
            className="mt-6 bg-wood px-5 py-3 text-sm text-canvas"
            onClick={() => {
              add({ sku: product.sku, name: product.name, quantity: qty, notes: note });
              setAdded(true);
            }}
          >
            Add to inquiry
          </button>
          {added ? (
            <p className="mt-4 text-sm">
              Added.{" "}
              <Link to="/inquiry" className="underline">
                Review the inquiry
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}
