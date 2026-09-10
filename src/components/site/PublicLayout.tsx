import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useViewer } from "@/hooks/useViewer";
import { homePathForViewer } from "@/lib/access";

const nav = [
  { to: "/tjanster", label: "Tjänsten" },
  { to: "/priser", label: "Priser" },
  { to: "/vanliga-fragor", label: "Vanliga frågor" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          activeProps={{ className: "text-foreground font-medium" }}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const { viewer } = useViewer();
  const signedIn = !!viewer?.userId;

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#innehall"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Hoppa till innehåll
      </a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" aria-label="Aurora Care, till startsidan">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Huvudmeny">
            <NavLinks />
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to={signedIn ? homePathForViewer(viewer) : "/auth"}>
                {signedIn ? "Mitt konto" : "Logga in"}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/kontakt">Boka genomgång</Link>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Öppna meny">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Meny</SheetTitle>
              <div className="mt-6 flex flex-col gap-2">
                <NavLinks />
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link to={signedIn ? homePathForViewer(viewer) : "/auth"}>
                      {signedIn ? "Mitt konto" : "Logga in"}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/kontakt">Boka genomgång</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="innehall" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/70 bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Aurora Care är Aurora Media AB:s abonnemang för löpande WordPress-underhåll:
              övervakning, säkerhetskopior, uppdateringar och en rapport varje månad.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Tjänsten</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tjanster" className="hover:text-foreground">
                  Så fungerar underhållet
                </Link>
              </li>
              <li>
                <Link to="/priser" className="hover:text-foreground">
                  Planer och priser
                </Link>
              </li>
              <li>
                <Link to="/vanliga-fragor" className="hover:text-foreground">
                  Vanliga frågor
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Kund hos oss</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" className="hover:text-foreground">
                  Logga in i kundportalen
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="hover:text-foreground">
                  Kontakta support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Aurora Media AB</h2>
            <address className="mt-3 space-y-1 text-sm not-italic text-muted-foreground">
              <p>Sverige</p>
              <p>
                <a href="mailto:hej@auroramedia.se" className="hover:text-foreground">
                  hej@auroramedia.se
                </a>
              </p>
            </address>
          </div>
        </div>
        <div className="border-t border-border/70">
          <p className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aurora Media AB. Aurora Care är en tjänst för
            WordPress-underhåll. WordPress är ett varumärke som tillhör WordPress Foundation.
          </p>
        </div>
      </footer>
    </div>
  );
}
