import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useViewer } from "@/hooks/useViewer";
import { homePathForViewer } from "@/lib/access";

const title = "Logga in i Aurora Care";
const description = "Inloggning för kunder och Aurora Media AB:s administration.";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { viewer, loading } = useViewer();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && viewer?.userId) {
      navigate({ to: homePathForViewer(viewer), replace: true });
    }
  }, [loading, viewer, navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) setMessage("Inloggningen misslyckades. Kontrollera e-post och lösenord.");
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: String(form.get("fullName") ?? "") },
      },
    });
    setPending(false);
    setMessage(
      error
        ? "Kontot kunde inte skapas. Kontrollera uppgifterna och försök igen."
        : "Kontot är skapat. Kontrollera din e-post om bekräftelse krävs, och be Aurora Media koppla ditt konto till rätt organisation.",
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-block">
          <Logo />
        </Link>
        <Card className="card-elevated border-border/70">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold">Logga in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kundportal och administration för Aurora Care.
            </p>
            <Tabs defaultValue="in" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="in">Logga in</TabsTrigger>
                <TabsTrigger value="ny">Nytt konto</TabsTrigger>
              </TabsList>
              <TabsContent value="in">
                <form className="mt-4 grid gap-4" onSubmit={signIn}>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Lösenord</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Loggar in…" : "Logga in"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="ny">
                <form className="mt-4 grid gap-4" onSubmit={signUp}>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Namn</Label>
                    <Input id="fullName" name="fullName" autoComplete="name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email-new">E-post</Label>
                    <Input id="email-new" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password-new">Lösenord</Label>
                    <Input
                      id="password-new"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Skapar konto…" : "Skapa konto"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            {message ? (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Aurora Media AB · Aurora Care
        </p>
      </div>
    </main>
  );
}
