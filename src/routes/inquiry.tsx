import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { submitInquiry } from "@/lib/api";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/inquiry")({ component: InquiryPage });

function InquiryPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const setNotes = useCart((s) => s.setNotes);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
    company: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [ref, setRef] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((current) => ({ ...current, [key]: event.target.value })),
    };
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!lines.length) {
      setError("Add at least one piece, or describe a custom order.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitInquiry({ ...form, items: lines });
      setRef(result.id);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the inquiry.");
    } finally {
      setBusy(false);
    }
  }

  if (ref) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-5 py-20">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Received</p>
          <h1 className="mt-3 font-serif text-4xl">Inquiry {ref} is with the workshop.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            We will call you on the number you left, confirm the timber, and send a quotation before
            anything is made.
          </p>
          <Link to="/catalog" className="mt-8 inline-block border border-ink px-5 py-3 text-sm">
            Return to the catalog
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl">Your inquiry</h1>
          <p className="mt-3 text-sm text-muted">No payment is taken here. This is a request for a quotation.</p>
          {lines.length === 0 ? (
            <p className="mt-8 text-sm">
              The list is empty.{" "}
              <Link to="/catalog" className="underline">
                Open the catalog
              </Link>{" "}
              or{" "}
              <Link to="/custom" className="underline">
                describe a custom piece
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {lines.map((line) => (
                <li key={line.sku} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl">{line.name}</p>
                      <p className="text-xs text-muted">{line.sku}</p>
                    </div>
                    <button type="button" className="text-sm text-muted" onClick={() => remove(line.sku)}>
                      Remove
                    </button>
                  </div>
                  <label className="mt-3 block text-sm">
                    Quantity
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(event) => setQty(line.sku, Number(event.target.value) || 1)}
                      className="mt-1 w-24 border border-line bg-canvas px-3 py-2"
                    />
                  </label>
                  <label className="mt-3 block text-sm">
                    Notes for this item
                    <textarea
                      value={line.notes}
                      onChange={(event) => setNotes(line.sku, event.target.value)}
                      rows={2}
                      className="mt-1 w-full border border-line bg-canvas px-3 py-2"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form onSubmit={onSubmit} className="bg-surface p-6">
          <h2 className="font-serif text-2xl">Where should we reply?</h2>
          <div className="mt-6 grid gap-4">
            <Field label="Name" required {...field("name")} />
            <Field label="Mobile" required {...field("mobile")} />
            <Field label="Organisation" {...field("company")} />
            <Field label="Address" required {...field("address")} />
            <Field label="Pincode" required {...field("pincode")} />
            <label className="text-sm">
              Notes for the whole order
              <textarea {...field("notes")} rows={3} className="mt-1 w-full border border-line bg-canvas px-3 py-3" />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm text-wood">{error}</p> : null}
          <button type="submit" disabled={busy} className="mt-6 bg-ink px-5 py-3 text-sm text-canvas disabled:opacity-60">
            {busy ? "Sending…" : "Submit inquiry"}
          </button>
        </form>
      </div>
    </Shell>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="text-sm">
      {label}
      <input {...props} className="mt-1 w-full border border-line bg-canvas px-3 py-3" />
    </label>
  );
}
