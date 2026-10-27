import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/custom")({ component: CustomPage });

function CustomPage() {
  const add = useCart((s) => s.add);
  const navigate = useNavigate();
  const [brief, setBrief] = useState({
    title: "",
    quantity: 1,
    wood: "Mango",
    details: "",
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const sku = `CUSTOM-${Date.now().toString().slice(-6)}`;
    add({
      sku,
      name: brief.title || "Custom commission",
      quantity: Math.max(1, brief.quantity),
      notes: `Wood: ${brief.wood}. ${brief.details}`.trim(),
    });
    navigate({ to: "/inquiry" });
  }

  return (
    <Shell>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Commission</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">If it can be cut from timber, describe it.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Organisations, shops, and wholesalers use this for fittings that are not in the catalog —
            reception desks, school furniture, branded objects, or a run of chairs to a drawing. The
            brief is added to your inquiry. We quote before we cut.
          </p>
          <img src="/media/grain.jpg" alt="Mango wood grain" className="mt-8 aspect-[4/3] w-full object-cover" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            What should we make?
            <input
              required
              value={brief.title}
              onChange={(event) => setBrief({ ...brief, title: event.target.value })}
              className="mt-1 w-full border border-line bg-canvas px-3 py-3"
              placeholder="Reception counter, 2.4 metres"
            />
          </label>
          <label className="block text-sm">
            Quantity
            <input
              type="number"
              min={1}
              value={brief.quantity}
              onChange={(event) => setBrief({ ...brief, quantity: Number(event.target.value) || 1 })}
              className="mt-1 w-32 border border-line bg-canvas px-3 py-3"
            />
          </label>
          <label className="block text-sm">
            Preferred wood
            <select
              value={brief.wood}
              onChange={(event) => setBrief({ ...brief, wood: event.target.value })}
              className="mt-1 w-full border border-line bg-canvas px-3 py-3"
            >
              <option>Mango</option>
              <option>Teak</option>
              <option>Sheesham</option>
              <option>Advise us</option>
            </select>
          </label>
          <label className="block text-sm">
            Dimensions, finish, and who it is for
            <textarea
              required
              rows={6}
              value={brief.details}
              onChange={(event) => setBrief({ ...brief, details: event.target.value })}
              className="mt-1 w-full border border-line bg-canvas px-3 py-3"
            />
          </label>
          <button type="submit" className="bg-wood px-5 py-3 text-sm text-canvas">
            Add brief to inquiry
          </button>
        </form>
      </div>
    </Shell>
  );
}
