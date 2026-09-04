import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, Boxes, Check, ChevronRight, CircleDollarSign, Clock3, Film, ImagePlus, Inbox, LayoutDashboard, Loader2, LogOut, Menu, MessageSquareQuote, PackageCheck, Plus, Save, Search, ShoppingBag, Trash2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { getAdminData, getAdminState, claimInitialAdmin, mutateAdminData, type AdminMutation } from "@/lib/admin.functions";
import { inr } from "@/lib/shop-data";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Section = "dashboard" | "orders" | "products" | "customers" | "reviews" | "reels" | "messages";
const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Boxes }, { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: MessageSquareQuote }, { id: "reels", label: "Reels", icon: Film },
  { id: "messages", label: "Messages", icon: Inbox },
];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Dashboard — Veerja Eats" }, { name: "description", content: "Manage Veerja Eats orders, products, customers, reviews, reels, and messages." },
    { property: "og:title", content: "Admin Dashboard — Veerja Eats" }, { property: "og:description", content: "Private Veerja Eats management workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const stateFn = useServerFn(getAdminState); const dataFn = useServerFn(getAdminData); const claimFn = useServerFn(claimInitialAdmin); const mutateFn = useServerFn(mutateAdminData);
  const [section, setSection] = useState<Section>("dashboard"); const [mobileNav, setMobileNav] = useState(false); const [search, setSearch] = useState("");
  const state = useQuery({ queryKey: ["admin-state"], queryFn: () => stateFn() });
  const data = useQuery({ queryKey: ["admin-data"], queryFn: () => dataFn(), enabled: state.data?.isAdmin === true });
  const mutation = useMutation({ mutationFn: (payload: AdminMutation) => mutateFn({ data: payload }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-data"] }); toast.success("Changes saved"); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save changes") });
  const title = NAV.find((item) => item.id === section)?.label ?? "Dashboard";
  const logout = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };
  if (state.isLoading) return <LoadingScreen />;
  if (!state.data?.isAdmin) return <AccessSetup canClaim={Boolean(state.data?.canClaim)} onClaim={async () => { await claimFn(); await queryClient.invalidateQueries({ queryKey: ["admin-state"] }); }} onLogout={logout} />;
  const content = data.data;
  return <div className="min-h-screen bg-beige/55 text-foreground">
    <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 border-r border-cream/15 bg-brown text-cream transition-transform lg:translate-x-0", mobileNav ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex h-20 items-center justify-between border-b border-cream/15 px-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-gold font-semibold text-brown">वी</span><div><p className="font-display text-xl font-semibold text-cream">Veerja Eats</p><p className="text-[10px] uppercase text-cream/70">Control room</p></div></div><Button variant="ghost" size="icon" onClick={() => setMobileNav(false)} className="text-cream hover:bg-cream/10 hover:text-cream lg:hidden"><X /></Button></div>
      <nav className="space-y-1 p-3">{NAV.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => { setSection(id); setMobileNav(false); }} className={cn("w-full justify-start text-cream/80 hover:bg-cream/10 hover:text-cream", section === id && "bg-gold text-brown hover:bg-gold hover:text-brown")}><Icon />{label}{id === "messages" && content && content.messages.filter((m) => m.status === "unread").length > 0 && <span className={cn("ml-auto rounded-full px-2 py-0.5 text-xs", section === id ? "bg-brown/15 text-brown" : "bg-cream/15 text-cream")}>{content.messages.filter((m) => m.status === "unread").length}</span>}</Button>)}</nav>
      <div className="absolute right-3 bottom-4 left-3"><Button variant="ghost" onClick={logout} className="w-full justify-start text-cream/80 hover:bg-cream/10 hover:text-cream"><LogOut /> Sign out</Button></div>
    </aside>
    <main className="min-w-0 lg:pl-64"><header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-7"><Button variant="outline" size="icon" onClick={() => setMobileNav(true)} className="lg:hidden"><Menu /></Button><div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase text-gold-deep">Admin workspace</p><h1 className="truncate font-display text-2xl font-semibold text-brown">{title}</h1></div><a href="/" className="hidden text-sm font-medium text-muted-foreground hover:text-brown sm:block">View storefront</a></header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-7">{data.isLoading && <LoadingPanel />}{data.isError && <ErrorPanel message="The admin data could not be loaded." />}{content && <AdminContent section={section} data={content} search={search} setSearch={setSearch} mutate={(payload) => mutation.mutate(payload)} busy={mutation.isPending} />}</div>
    </main><Toaster position="bottom-right" />
  </div>;
}

function LoadingScreen() { return <main className="grid min-h-screen place-items-center bg-beige"><Loader2 className="h-8 w-8 animate-spin text-gold-deep" /></main>; }
function LoadingPanel() { return <div className="grid min-h-[55vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-gold-deep" /></div>; }
function ErrorPanel({ message }: { message: string }) { return <div className="rounded-lg border border-destructive/25 bg-card p-8 text-center text-destructive">{message}</div>; }
function AccessSetup({ canClaim, onClaim, onLogout }: { canClaim: boolean; onClaim: () => Promise<void>; onLogout: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return <main className="grid min-h-screen place-items-center bg-beige px-4"><section className="max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-warm"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-gold-deep"><PackageCheck /></span><h1 className="mt-5 font-display text-3xl font-semibold text-brown">{canClaim ? "Set up the first admin" : "Access restricted"}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{canClaim ? "No administrator exists yet. Claim this workspace with your signed-in account." : "Your account is signed in, but it does not have administrator access."}</p><div className="mt-6 flex justify-center gap-3">{canClaim && <Button disabled={busy} onClick={async () => { setBusy(true); await onClaim(); setBusy(false); }} className="bg-brown text-primary-foreground hover:bg-brown/90">{busy ? <Loader2 className="animate-spin" /> : <Check />}Claim admin access</Button>}<Button variant="outline" onClick={onLogout}>Sign out</Button></div></section></main>;
}

type AdminData = Awaited<ReturnType<typeof getAdminData>>;
type MutationPayload = AdminMutation;
function AdminContent({ section, data, search, setSearch, mutate, busy }: { section: Section; data: AdminData; search: string; setSearch: (value: string) => void; mutate: (data: MutationPayload) => void; busy: boolean }) {
  const orders = data.orders; const revenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  if (section === "dashboard") return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CircleDollarSign} label="Revenue" value={inr(revenue)} note="Non-cancelled orders" /><Metric icon={ShoppingBag} label="Orders" value={String(orders.length)} note={`${orders.filter((o) => o.status === "new").length} awaiting action`} /><Metric icon={Users} label="Customers" value={String(data.customers.length)} note="All-time customers" /><Metric icon={Inbox} label="Unread messages" value={String(data.messages.filter((m) => m.status === "unread").length)} note={`${data.reviews.filter((r) => r.status === "pending").length} reviews pending`} /></div><section className="mt-6 bg-card p-5 shadow-warm"><SectionTitle title="Recent orders" subtitle="Latest purchases across the store" /><OrdersTable orders={orders.slice(0, 6)} mutate={mutate} busy={busy} /></section></>;
  if (section === "orders") { const filtered = orders.filter((o) => `${o.order_number} ${o.customers?.full_name ?? ""} ${o.customers?.mobile ?? ""}`.toLowerCase().includes(search.toLowerCase())); return <section className="bg-card p-5 shadow-warm"><SectionTitle title="Orders" subtitle="Track, search, and fulfil customer orders" search={search} setSearch={setSearch} /><OrdersTable orders={filtered} mutate={mutate} busy={busy} /></section>; }
  if (section === "products") return <ProductsPanel products={data.products} mutate={mutate} busy={busy} />;
  if (section === "customers") return <section className="bg-card p-5 shadow-warm"><SectionTitle title="Customers" subtitle="Customer contacts and purchase history" /><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="py-3">Customer</th><th>Contact</th><th>Location</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>{data.customers.map((c) => <tr key={c.id} className="border-b border-border/60"><td className="py-4 font-medium text-brown">{c.full_name}</td><td><p>{c.email}</p><p className="text-muted-foreground">{c.mobile}</p></td><td>{c.city}, {c.state}</td><td>{c.orders.length}</td><td className="font-semibold">{inr(c.orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0))}</td></tr>)}</tbody></table><Empty show={!data.customers.length} label="No customers yet" /></div></section>;
  if (section === "reviews") return <ReviewsPanel reviews={data.reviews} mutate={mutate} busy={busy} />;
  if (section === "reels") return <ReelsPanel reels={data.reels} mutate={mutate} busy={busy} />;
  return <section className="bg-card p-5 shadow-warm"><SectionTitle title="Customer messages" subtitle="Read and resolve storefront enquiries" /><div className="mt-5 grid gap-3">{data.messages.map((message) => <article key={message.id} className="grid gap-3 border-b border-border p-4 lg:grid-cols-[220px_1fr_auto]"><div><p className="font-semibold text-brown">{message.name}</p><p className="text-xs text-muted-foreground">{message.email}</p><p className="text-xs text-muted-foreground">{message.phone}</p></div><div><div className="flex gap-2"><h3 className="font-medium">{message.subject}</h3><Status value={message.status} /></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{message.message}</p></div><Select value={message.status} onValueChange={(value: "unread" | "read" | "resolved") => mutate({ action: "messageStatus", id: message.id, value })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unread">Unread</SelectItem><SelectItem value="read">Read</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select></article>)}<Empty show={!data.messages.length} label="Inbox is clear" /></div></section>;
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof BarChart3; label: string; value: string; note: string }) { return <article className="border-l-4 border-gold bg-card p-5 shadow-warm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-5 w-5 text-gold-deep" /></div><p className="mt-4 font-display text-3xl font-semibold text-brown">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></article>; }
function SectionTitle({ title, subtitle, search, setSearch }: { title: string; subtitle: string; search?: string; setSearch?: (value: string) => void }) { return <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-display text-2xl font-semibold text-brown">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div>{setSearch && <div className="relative"><Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders" className="w-64 pl-9" /></div>}</div>; }
function Status({ value }: { value: string }) { const good = ["approved", "delivered", "resolved", "published"].includes(value); const pending = ["new", "pending", "unread"].includes(value); return <span className={cn("inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase", good ? "bg-leaf/12 text-leaf" : pending ? "bg-gold/20 text-gold-deep" : "bg-secondary text-muted-foreground")}>{value}</span>; }
function Empty({ show, label }: { show: boolean; label: string }) { return show ? <div className="py-14 text-center text-sm text-muted-foreground">{label}</div> : null; }
function ReviewsPanel({ reviews, mutate, busy }: { reviews: AdminData["reviews"]; mutate: (data: MutationPayload) => void; busy: boolean }) {
  return <section className="bg-card p-5 shadow-warm"><SectionTitle title="Customer reviews" subtitle="Edit every detail and choose what appears on the storefront" /><div className="mt-5 grid gap-4 xl:grid-cols-2">{reviews.map((review) => <ReviewEditor key={review.id} review={review} mutate={mutate} busy={busy} />)}<Empty show={!reviews.length} label="No customer reviews yet" /></div></section>;
}
function ReviewEditor({ review, mutate, busy }: { review: AdminData["reviews"][number]; mutate: (data: MutationPayload) => void; busy: boolean }) {
  const [customerName, setCustomerName] = useState(review.customer_name); const [city, setCity] = useState(review.city);
  const [rating, setRating] = useState(String(review.rating)); const [text, setText] = useState(review.review); const [status, setStatus] = useState(review.status);
  return <article className="border border-border bg-background p-4">
    <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-gold-deep">{"★".repeat(Number(rating) || 0)}</span><Status value={status} /></div><Button size="icon" variant="ghost" aria-label="Delete review" disabled={busy} onClick={() => { if (confirm(`Delete the review from ${customerName}?`)) mutate({ action: "deleteReview", id: review.id }); }}><Trash2 /></Button></div>
    <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor={`review-name-${review.id}`}>Customer name</Label><Input id={`review-name-${review.id}`} value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div><div><Label htmlFor={`review-city-${review.id}`}>City</Label><Input id={`review-city-${review.id}`} value={city} onChange={(e) => setCity(e.target.value)} /></div><div><Label htmlFor={`review-rating-${review.id}`}>Rating</Label><Select value={rating} onValueChange={setRating}><SelectTrigger id={`review-rating-${review.id}`}><SelectValue /></SelectTrigger><SelectContent>{[5, 4, 3, 2, 1].map((value) => <SelectItem key={value} value={String(value)}>{value} stars</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor={`review-status-${review.id}`}>Visibility</Label><Select value={status} onValueChange={(value: "pending" | "approved" | "rejected") => setStatus(value)}><SelectTrigger id={`review-status-${review.id}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="approved">Published</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Hidden</SelectItem></SelectContent></Select></div></div>
    <div className="mt-3"><Label htmlFor={`review-text-${review.id}`}>Review message</Label><Textarea id={`review-text-${review.id}`} rows={4} value={text} onChange={(e) => setText(e.target.value)} /></div>
    <Button className="mt-4 bg-leaf text-accent-foreground hover:bg-leaf/90" disabled={busy || customerName.trim().length < 2 || text.trim().length < 2} onClick={() => mutate({ action: "updateReview", id: review.id, customerName: customerName.trim(), city: city.trim(), rating: Number(rating), review: text.trim(), status })}>{busy ? <Loader2 className="animate-spin" /> : <Save />}Save review</Button>
  </article>;
}
function OrdersTable({ orders, mutate, busy }: { orders: AdminData["orders"]; mutate: (data: MutationPayload) => void; busy: boolean }) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="py-3">Order</th><th>Customer</th><th>Items</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-border/60"><td className="py-4 font-semibold text-brown">#{order.order_number}</td><td><p>{order.customers?.full_name}</p><p className="text-xs text-muted-foreground">{order.customers?.mobile}</p></td><td>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>{new Date(order.created_at).toLocaleDateString("en-IN")}</td><td className="font-semibold">{inr(order.total)}</td><td><Select disabled={busy} value={order.status} onValueChange={(value: "new" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled") => mutate({ action: "orderStatus", id: order.id, value })}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{["new", "confirmed", "packed", "shipped", "delivered", "cancelled"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></td></tr>)}</tbody></table><Empty show={!orders.length} label="No orders found" /></div>; }
type VariantDraft = { label: string; sku: string; mrp: string; discount: string; stock: string };
const emptyVariant: VariantDraft = { label: "", sku: "", mrp: "", discount: "0", stock: "0" };
const discountOf = (mrp: number, price: number) => (mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0);

function ProductsPanel({ products, mutate, busy }: { products: AdminData["products"]; mutate: (data: MutationPayload) => void; busy: boolean }) {
  const [showForm, setShowForm] = useState(false);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <SectionTitle title="Products & inventory" subtitle="Add products, set pack pricing, discounts, and stock" />
      <Button onClick={() => setShowForm((open) => !open)} className="bg-gold text-brown shadow-warm hover:bg-gold-deep hover:text-cream">{showForm ? <X /> : <Plus />}{showForm ? "Close form" : "Add product"}</Button>
    </div>
    {showForm && <AddProductForm busy={busy} mutate={mutate} onDone={() => setShowForm(false)} />}
    {products.map((product) => <section key={product.id} className="bg-card p-5 shadow-warm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="font-display text-2xl font-semibold text-brown">{product.name}</h2><p className="text-xs text-muted-foreground">/{product.slug}</p><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{product.description}</p></div>
        <div className="flex items-center gap-2">
          <Button variant={product.is_active ? "outline" : "default"} onClick={() => mutate({ action: "toggleProduct", id: product.id, value: !product.is_active })}>{product.is_active ? "Active on store" : "Hidden"}</Button>
          <Button size="icon" variant="ghost" aria-label="Delete product" disabled={busy} onClick={() => { if (confirm(`Delete ${product.name} and all its pack sizes?`)) mutate({ action: "deleteProduct", id: product.id }); }}><Trash2 /></Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {product.product_variants.map((variant) => <VariantEditor key={variant.id} variant={variant} mutate={mutate} busy={busy} />)}
        <AddVariantForm productId={product.id} mutate={mutate} busy={busy} />
      </div>
    </section>)}
    <Empty show={!products.length} label="No products yet — add your first product above" />
  </div>;
}

function VariantFields({ value, onChange, idPrefix }: { value: VariantDraft; onChange: (next: VariantDraft) => void; idPrefix: string }) {
  const mrp = Number(value.mrp) || 0; const discount = Number(value.discount) || 0;
  const price = Math.max(0, Math.round(mrp * (1 - discount / 100)));
  return <div className="grid gap-3 sm:grid-cols-2">
    <div><Label htmlFor={`${idPrefix}-label`} className="text-xs">Pack size / label</Label><Input id={`${idPrefix}-label`} value={value.label} placeholder="500 ml" onChange={(e) => onChange({ ...value, label: e.target.value })} required /></div>
    <div><Label htmlFor={`${idPrefix}-sku`} className="text-xs">SKU</Label><Input id={`${idPrefix}-sku`} value={value.sku} placeholder="VE-A2-500" onChange={(e) => onChange({ ...value, sku: e.target.value })} required /></div>
    <div><Label htmlFor={`${idPrefix}-mrp`} className="text-xs">MRP (₹)</Label><Input id={`${idPrefix}-mrp`} type="number" min={1} value={value.mrp} onChange={(e) => onChange({ ...value, mrp: e.target.value })} required /></div>
    <div><Label htmlFor={`${idPrefix}-discount`} className="text-xs">Discount (%)</Label><Input id={`${idPrefix}-discount`} type="number" min={0} max={90} value={value.discount} onChange={(e) => onChange({ ...value, discount: e.target.value })} /></div>
    <div><Label htmlFor={`${idPrefix}-stock`} className="text-xs">Stock</Label><Input id={`${idPrefix}-stock`} type="number" min={0} value={value.stock} onChange={(e) => onChange({ ...value, stock: e.target.value })} /></div>
    <div className="flex items-end"><p className="text-sm text-muted-foreground">Selling price <strong className="text-brown">{inr(price)}</strong>{discount > 0 && <span className="ml-1 text-gold-deep">({discount}% off)</span>}</p></div>
  </div>;
}

function AddProductForm({ mutate, busy, onDone }: { mutate: (data: MutationPayload) => void; busy: boolean; onDone: () => void }) {
  const [name, setName] = useState(""); const [shortName, setShortName] = useState(""); const [slug, setSlug] = useState("");
  const [description, setDescription] = useState(""); const [imageUrl, setImageUrl] = useState(""); const [imagePreview, setImagePreview] = useState(""); const [uploading, setUploading] = useState(false); const [active, setActive] = useState(true);
  const [variants, setVariants] = useState<VariantDraft[]>([{ ...emptyVariant }]);
  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Choose a JPG, PNG, or WebP image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be smaller than 5 MB"); return; }
    setUploading(true); setImagePreview(URL.createObjectURL(file));
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) { setImageUrl(""); toast.error("Image upload failed", { description: error.message }); return; }
    setImageUrl(`/api/public/product-image?path=${encodeURIComponent(path)}`); toast.success("Product image uploaded");
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate({
      action: "addProduct", name: name.trim(), shortName: (shortName || name).trim(),
      slug: (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: description.trim(), imageUrl: imageUrl.trim(), active,
      variants: variants.map((variant) => ({ label: variant.label.trim(), sku: variant.sku.trim(), mrp: Number(variant.mrp) || 0, discount: Number(variant.discount) || 0, stock: Number(variant.stock) || 0 })),
    });
    onDone();
  };
  return <form onSubmit={submit} className="overflow-hidden border border-gold/35 bg-cream shadow-warm">
    <div className="border-b border-gold/30 bg-brown px-5 py-5 text-cream"><h2 className="font-display text-2xl font-semibold">New product</h2><p className="mt-1 text-sm text-cream/75">Fill in the details, upload a photo, and add at least one pack size</p></div>
    <div className="p-5">
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div><Label htmlFor="p-name">Product name</Label><Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Veerja A2 Bilona Ghee" required minLength={2} /></div>
      <div><Label htmlFor="p-short">Short name</Label><Input id="p-short" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="A2 Ghee" /></div>
      <div><Label htmlFor="p-slug">URL slug</Label><Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="veerja-a2-ghee" /><p className="mt-1 text-xs text-muted-foreground">Leave blank to generate from the name.</p></div>
      <div><Label htmlFor="p-image">Product image</Label><label htmlFor="p-image" className="mt-1 flex min-h-28 cursor-pointer items-center gap-4 border border-dashed border-gold-deep/45 bg-beige/55 p-4 transition-colors hover:bg-gold/10">{imagePreview ? <img src={imagePreview} alt="Product preview" className="h-20 w-20 object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center bg-gold/20 text-gold-deep"><ImagePlus /></span>}<span><span className="flex items-center gap-2 font-medium text-brown">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? "Uploading image…" : imageUrl ? "Choose a different image" : "Choose product image"}</span><span className="mt-1 block text-xs text-muted-foreground">JPG, PNG or WebP · maximum 5 MB</span></span></label><Input id="p-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); }} /></div>
      <div className="lg:col-span-2"><Label htmlFor="p-desc">Description</Label><Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Hand-churned in small batches..." /></div>
    </div>
    <div className="mt-6 space-y-4">
      {variants.map((variant, index) => <div key={index} className="border border-gold/25 bg-background p-4">
        <div className="mb-3 flex items-center justify-between"><strong className="text-sm text-brown">Pack size {index + 1}</strong>{variants.length > 1 && <Button type="button" size="icon" variant="ghost" aria-label="Remove pack size" onClick={() => setVariants(variants.filter((_, i) => i !== index))}><Trash2 /></Button>}</div>
        <VariantFields idPrefix={`new-${index}`} value={variant} onChange={(next) => setVariants(variants.map((item, i) => (i === index ? next : item)))} />
      </div>)}
      <Button type="button" variant="outline" className="border-gold-deep/40 text-brown hover:bg-gold/10" onClick={() => setVariants([...variants, { ...emptyVariant }])}><Plus /> Add another pack size</Button>
    </div>
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Publish on storefront</label>
       <Button type="submit" disabled={busy || uploading || !imageUrl} className="bg-leaf text-accent-foreground hover:bg-leaf/90">{busy || uploading ? <Loader2 className="animate-spin" /> : <Check />}Create product</Button>
    </div>
    </div>
  </form>;
}

function AddVariantForm({ productId, mutate, busy }: { productId: string; mutate: (data: MutationPayload) => void; busy: boolean }) {
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState<VariantDraft>({ ...emptyVariant });
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="grid min-h-[140px] place-items-center border border-dashed border-border bg-background p-4 text-sm font-medium text-gold-deep hover:bg-beige/40"><span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add pack size</span></button>;
  return <div className="border border-border bg-background p-4">
    <VariantFields idPrefix={`v-${productId}`} value={draft} onChange={setDraft} />
    <div className="mt-3 flex gap-2">
      <Button size="sm" disabled={busy} onClick={() => { mutate({ action: "addVariant", productId, label: draft.label.trim(), sku: draft.sku.trim(), mrp: Number(draft.mrp) || 0, discount: Number(draft.discount) || 0, stock: Number(draft.stock) || 0 }); setDraft({ ...emptyVariant }); setOpen(false); }}>Save pack size</Button>
      <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    </div>
  </div>;
}

function VariantEditor({ variant, mutate, busy }: { variant: AdminData["products"][number]["product_variants"][number]; mutate: (data: MutationPayload) => void; busy: boolean }) {
  const [mrp, setMrp] = useState(String(variant.mrp));
  const [discount, setDiscount] = useState(String(discountOf(variant.mrp, variant.price)));
  const [stock, setStock] = useState(String(variant.stock));
  const price = Math.max(0, Math.round((Number(mrp) || 0) * (1 - (Number(discount) || 0) / 100)));
  return <div className="border border-border bg-background p-4">
    <div className="flex items-center justify-between gap-2">
      <div><strong className="text-brown">{variant.label}</strong><p className="text-xs text-muted-foreground">{variant.sku}</p></div>
      <div className="flex items-center gap-1"><Status value={variant.is_active ? "active" : "hidden"} /><Button size="icon" variant="ghost" aria-label="Delete pack size" disabled={busy} onClick={() => { if (confirm(`Delete pack size ${variant.label}?`)) mutate({ action: "deleteVariant", id: variant.id }); }}><Trash2 /></Button></div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">
      <div><Label className="text-xs">MRP</Label><Input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} /></div>
      <div><Label className="text-xs">Discount %</Label><Input type="number" min={0} max={90} value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
      <div><Label className="text-xs">Stock</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Sells at <strong className="text-brown">{inr(price)}</strong></p>
    <div className="mt-3 flex gap-2">
      <Button size="sm" disabled={busy} onClick={() => mutate({ action: "updateVariant", id: variant.id, price, mrp: Number(mrp) || 0, stock: Number(stock) || 0, active: variant.is_active })} className="flex-1">Save</Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => mutate({ action: "updateVariant", id: variant.id, price, mrp: Number(mrp) || 0, stock: Number(stock) || 0, active: !variant.is_active })}>{variant.is_active ? "Hide" : "Show"}</Button>
    </div>
  </div>;
}

function ReelsPanel({ reels, mutate, busy }: { reels: AdminData["reels"]; mutate: (data: MutationPayload) => void; busy: boolean }) { const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); mutate({ action: "addReel", title: String(form.get("title")), mediaUrl: String(form.get("mediaUrl")), caption: String(form.get("caption")), published: form.get("published") === "on" }); event.currentTarget.reset(); }; return <div className="grid gap-5 xl:grid-cols-[380px_1fr]"><form onSubmit={submit} className="bg-card p-5 shadow-warm"><SectionTitle title="Add reel" subtitle="Publish short-form brand content" /><div className="mt-5 space-y-4"><div><Label htmlFor="reel-title">Title</Label><Input id="reel-title" name="title" required minLength={2} /></div><div><Label htmlFor="media-url">Media URL</Label><Input id="media-url" name="mediaUrl" type="url" required /></div><div><Label htmlFor="caption">Caption</Label><Textarea id="caption" name="caption" /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" /> Publish now</label><Button type="submit" disabled={busy} className="w-full">Add reel</Button></div></form><section className="bg-card p-5 shadow-warm"><SectionTitle title="Reel library" subtitle="Manage visibility and remove old content" /><div className="mt-5 space-y-3">{reels.map((reel) => <div key={reel.id} className="flex items-center gap-3 border-b border-border p-3"><Film className="text-gold-deep" /><div className="min-w-0 flex-1"><p className="truncate font-medium text-brown">{reel.title}</p><p className="truncate text-xs text-muted-foreground">{reel.media_url}</p></div><Button size="sm" variant="outline" onClick={() => mutate({ action: "toggleReel", id: reel.id, value: !reel.is_published })}>{reel.is_published ? "Published" : "Draft"}</Button><Button size="icon" variant="ghost" aria-label="Delete reel" onClick={() => mutate({ action: "deleteReel", id: reel.id })}><Trash2 /></Button></div>)}<Empty show={!reels.length} label="No reels added" /></div></section></div>; }