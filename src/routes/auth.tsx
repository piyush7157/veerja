import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [
    { title: "Admin Sign In — Veerja Eats" },
    { name: "description", content: "Secure sign in for the Veerja Eats administration panel." },
    { property: "og:title", content: "Admin Sign In — Veerja Eats" },
    { property: "og:description", content: "Secure Veerja Eats administration access." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? ""); const password = String(form.get("password") ?? "");
    const result = mode === "signin" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) return setMessage("Check your email to confirm your account, then sign in.");
    const next = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/admin";
    await navigate({ to: next });
  };
  return <main className="grid min-h-screen place-items-center bg-beige px-4 py-10">
    <section className="w-full max-w-md rounded-lg border border-border bg-card p-7 shadow-warm-lg sm:p-9">
      <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brown"><ArrowLeft className="h-4 w-4" /> Storefront</a>
      <div className="mt-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-lg font-semibold text-primary-foreground">वी</span><div><p className="font-display text-2xl font-semibold text-brown">Veerja Admin</p><p className="text-xs text-muted-foreground">Private management workspace</p></div></div>
      <h1 className="mt-8 font-display text-3xl font-semibold text-brown">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" required className="mt-1.5" /></div>
        <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={8} required className="mt-1.5" /></div>
        {message && <p className="rounded-md bg-secondary px-3 py-2 text-sm text-foreground">{message}</p>}
        <Button type="submit" disabled={busy} className="w-full bg-brown text-primary-foreground hover:bg-brown/90">{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />}{mode === "signin" ? "Sign in" : "Sign up"}</Button>
      </form>
      <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }} className="mt-5 w-full text-center text-sm text-gold-deep hover:underline">{mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}</button>
    </section>
  </main>;
}