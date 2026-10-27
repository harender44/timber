import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Workshop</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
          An office, a bench, and timber we can stand behind.
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <img src="/media/workshop.jpg" alt="Timber stacked in the workshop" className="aspect-[4/3] object-cover" />
          <img src="/media/hero.jpg" alt="Finished pieces in the showroom" className="aspect-[4/3] object-cover" />
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            ["Who we sell to", "Retailers, wholesalers, hotels, schools, and companies placing a defined quantity — not a single impulse checkout."],
            ["What we make", "Chairs, tables, storage, toys, and anything else that can be resolved in wood. Mango is the house timber."],
            ["How an order moves", "You submit an inquiry. We speak, send a quotation, make the work, and deliver it."],
          ].map(([title, copy]) => (
            <div key={title}>
              <h2 className="font-serif text-2xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p>
            </div>
          ))}
        </div>
        <Link to="/catalog" className="mt-12 inline-block bg-ink px-5 py-3 text-sm text-canvas">
          Open the catalog
        </Link>
      </div>
    </Shell>
  );
}
