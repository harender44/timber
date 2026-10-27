import { Link, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/catalog", label: "Catalog" },
  { to: "/custom", label: "Custom" },
  { to: "/about", label: "Workshop" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const count = useCart((s) => s.lines.reduce((sum, line) => sum + line.quantity, 0));
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-serif text-2xl tracking-tight">
            HS Timber Works
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={path.startsWith(link.to) ? "text-ink" : "text-muted"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/inquiry"
            className="border border-ink px-4 py-2 text-sm"
          >
            Inquiry {count > 0 ? `(${count})` : ""}
          </Link>
        </div>
        <nav className="flex gap-5 overflow-x-auto border-t border-line px-5 py-3 text-sm md:hidden">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="shrink-0 text-muted">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl">HS Timber Works</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Mango and other hardwoods, made to order for retailers, wholesalers, and organisations.
            </p>
          </div>
          <div className="text-sm leading-7 text-muted">
            <p>Office and workshop</p>
            <p>Quthbullapur, Telangana</p>
            <p>Bulk quotations on request</p>
          </div>
          <div className="text-sm leading-7">
            <Link to="/catalog" className="block text-muted">
              Browse the catalog
            </Link>
            <Link to="/custom" className="block text-muted">
              Specify a custom piece
            </Link>
            <Link to="/admin" className="block text-muted">
              Workshop desk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
