import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, SectionHeading } from "@/components/site/Reveal";

const empty = { name: "", email: "", phone: "", subject: "", message: "" };

export function ContactSection() {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof empty) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const valid = form.name.trim().length > 1 && /.+@.+\..+/.test(form.email.trim()) && form.subject.trim().length > 1 && form.message.trim().length > 4;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) { toast.error("Please fill your name, email, subject and message"); return; }
    setBusy(true);
    const { error } = await supabase.from("customer_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      status: "unread",
    });
    setBusy(false);
    if (error) { toast.error("Could not send your message. Please try again."); return; }
    setForm(empty);
    toast.success("Thank you! Your message has reached our team.");
  }

  return (
    <section id="contact" className="bg-beige/40 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Talk to us" title="Send us a message" subtitle="Questions about purity, bulk orders or delivery? Write to us and we reply within a day." />
        <Reveal>
          <form onSubmit={submit} className="mt-10 grid gap-4 border border-gold/30 bg-card p-6 shadow-warm sm:grid-cols-2">
            <div>
              <Label htmlFor="contact-name">Your name</Label>
              <Input id="contact-name" value={form.name} onChange={set("name")} placeholder="Piyush Varma" />
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
            </div>
            <div>
              <Label htmlFor="contact-phone">Mobile (optional)</Label>
              <Input id="contact-phone" value={form.phone} onChange={set("phone")} placeholder="98765 43210" />
            </div>
            <div>
              <Label htmlFor="contact-subject">Subject</Label>
              <Input id="contact-subject" value={form.subject} onChange={set("subject")} placeholder="Bulk order enquiry" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" rows={5} value={form.message} onChange={set("message")} placeholder="Tell us what you need…" />
            </div>
            <Button type="submit" disabled={busy} className="bg-gold text-brown shadow-warm hover:bg-gold-deep hover:text-cream sm:col-span-2">
              {busy ? <Loader2 className="animate-spin" /> : <Send />}
              {busy ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
