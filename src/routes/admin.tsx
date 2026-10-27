import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import {
  adminLogin,
  createProduct,
  fetchInquiries,
  fetchProducts,
  removeProduct,
  setInquiryStatus,
} from "@/lib/api";
import type { Inquiry, Product } from "@/lib/types";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const STATUSES = ["new", "quoted", "making", "delivered"] as const;

function AdminPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState({
    sku: "",
    name: "",
    category: "Tables",
    wood: "Mango",
    summary: "",
    description: "",
  });

  useEffect(() => {
    const saved = sessionStorage.getItem("hs-timber-token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchInquiries(token), fetchProducts()])
      .then(([orders, catalog]) => {
        setInquiries(orders);
        setProducts(catalog);
      })
      .catch(() => {
        setToken("");
        sessionStorage.removeItem("hs-timber-token");
      });
  }, [token]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const next = await adminLogin(password);
      sessionStorage.setItem("hs-timber-token", next);
      setToken(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    }
  }

  if (!token) {
    return (
      <Shell>
        <form onSubmit={signIn} className="mx-auto max-w-md px-5 py-20">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Workshop desk</p>
          <h1 className="mt-3 font-serif text-4xl">Staff only.</h1>
          <p className="mt-3 text-sm text-muted">
            This page is not for viewers.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-6 w-full border border-line bg-canvas px-3 py-3"
            placeholder="Workshop key"
          />
          {error ? <p className="mt-3 text-sm text-wood">{error}</p> : null}
          <button type="submit" className="mt-4 bg-ink px-5 py-3 text-sm text-canvas">
            Enter
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-serif text-4xl">Desk</h1>
          <button
            type="button"
            className="text-sm text-muted"
            onClick={() => {
              sessionStorage.removeItem("hs-timber-token");
              setToken("");
            }}
          >
            Leave
          </button>
        </div>

        <h2 className="mt-10 font-serif text-2xl">Inquiries</h2>
        {inquiries.length === 0 ? <p className="mt-4 text-sm text-muted">No submissions yet.</p> : null}
        <div className="mt-4 space-y-4">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl">
                    #{inquiry.id} · {inquiry.name}
                  </p>
                  <p className="text-sm text-muted">
                    {inquiry.mobile} · {inquiry.pincode}
                    {inquiry.company ? ` · ${inquiry.company}` : ""}
                  </p>
                  <p className="mt-1 text-sm">{inquiry.address}</p>
                </div>
                <select
                  value={inquiry.status}
                  onChange={async (event) => {
                    const status = event.target.value;
                    await setInquiryStatus(token, inquiry.id, status);
                    setInquiries((current) =>
                      current.map((item) => (item.id === inquiry.id ? { ...item, status } : item)),
                    );
                  }}
                  className="border border-line bg-canvas px-3 py-2 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <ul className="mt-3 text-sm leading-6">
                {inquiry.items.map((item) => (
                  <li key={item.sku}>
                    {item.quantity} × {item.name} ({item.sku})
                    {item.notes ? ` — ${item.notes}` : ""}
                  </li>
                ))}
              </ul>
              {inquiry.notes ? <p className="mt-2 text-sm text-muted">{inquiry.notes}</p> : null}
            </article>
          ))}
        </div>

        <h2 className="mt-14 font-serif text-2xl">Catalog</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>
                {product.sku} · {product.name}
              </span>
              <button
                type="button"
                className="text-muted"
                onClick={async () => {
                  await removeProduct(token, product.id);
                  setProducts((current) => current.filter((item) => item.id !== product.id));
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form
          className="mt-8 grid gap-3 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const created = await createProduct(token, {
              ...draft,
              images: ["/media/grain.jpg", "/media/workshop.jpg"],
            });
            setProducts((current) => [...current, created]);
            setDraft({ sku: "", name: "", category: "Tables", wood: "Mango", summary: "", description: "" });
          }}
        >
          <input
            required
            placeholder="Product id, e.g. HS-NEW-01"
            value={draft.sku}
            onChange={(event) => setDraft({ ...draft, sku: event.target.value })}
            className="border border-line bg-canvas px-3 py-3 text-sm"
          />
          <input
            required
            placeholder="Name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="border border-line bg-canvas px-3 py-3 text-sm"
          />
          <input
            required
            placeholder="Short description"
            value={draft.summary}
            onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
            className="border border-line bg-canvas px-3 py-3 text-sm md:col-span-2"
          />
          <textarea
            required
            placeholder="Full description"
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            className="border border-line bg-canvas px-3 py-3 text-sm md:col-span-2"
            rows={3}
          />
          <button type="submit" className="bg-wood px-5 py-3 text-sm text-canvas md:col-span-2 md:w-fit">
            Add product
          </button>
        </form>
      </div>
    </Shell>
  );
}
