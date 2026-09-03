import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getAdminClientFor(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) throw new Error("Forbidden: administrator access required");
  return supabaseAdmin;
}

export const getAdminState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: role }, { count }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle(),
      supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    ]);
    return { isAdmin: Boolean(role), canClaim: (count ?? 0) === 0 };
  });

export const claimInitialAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An administrator already exists");
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) throw error;
    return { ok: true };
  });

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await getAdminClientFor(context.userId);
    const [orders, products, customers, reviews, reels, messages] = await Promise.all([
      db.from("orders").select("*, customers(*), order_items(*)").order("created_at", { ascending: false }),
      db.from("products").select("*, product_variants(*)").order("created_at"),
      db.from("customers").select("*, orders(id,total,status,created_at)").order("created_at", { ascending: false }),
      db.from("reviews").select("*").order("created_at", { ascending: false }),
      db.from("reels").select("*").order("sort_order"),
      db.from("customer_messages").select("*").order("created_at", { ascending: false }),
    ]);
    const failed = [orders, products, customers, reviews, reels, messages].find((result) => result.error);
    if (failed?.error) throw failed.error;
    return {
      orders: orders.data ?? [], products: products.data ?? [], customers: customers.data ?? [],
      reviews: reviews.data ?? [], reels: reels.data ?? [], messages: messages.data ?? [],
    };
  });

export const mutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("orderStatus"), id: z.string().uuid(), value: z.enum(["new", "confirmed", "packed", "shipped", "delivered", "cancelled"]) }),
  z.object({ action: z.literal("reviewStatus"), id: z.string().uuid(), value: z.enum(["pending", "approved", "rejected"]) }),
  z.object({ action: z.literal("messageStatus"), id: z.string().uuid(), value: z.enum(["unread", "read", "resolved"]) }),
  z.object({ action: z.literal("toggleProduct"), id: z.string().uuid(), value: z.boolean() }),
  z.object({ action: z.literal("updateVariant"), id: z.string().uuid(), price: z.number().int().min(0), mrp: z.number().int().min(0), stock: z.number().int().min(0), active: z.boolean() }),
  z.object({ action: z.literal("addReel"), title: z.string().min(2).max(120), mediaUrl: z.string().url(), caption: z.string().max(500), published: z.boolean() }),
  z.object({ action: z.literal("toggleReel"), id: z.string().uuid(), value: z.boolean() }),
  z.object({ action: z.literal("deleteReel"), id: z.string().uuid() }),
]);

export type AdminMutation = z.infer<typeof mutationSchema>;

export const mutateAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => mutationSchema.parse(input))
  .handler(async ({ context, data }) => {
    const db = await getAdminClientFor(context.userId);
    let result;
    if (data.action === "orderStatus") result = await db.from("orders").update({ status: data.value }).eq("id", data.id);
    else if (data.action === "reviewStatus") result = await db.from("reviews").update({ status: data.value }).eq("id", data.id);
    else if (data.action === "messageStatus") result = await db.from("customer_messages").update({ status: data.value }).eq("id", data.id);
    else if (data.action === "toggleProduct") result = await db.from("products").update({ is_active: data.value }).eq("id", data.id);
    else if (data.action === "updateVariant") {
      if (data.mrp < data.price) throw new Error("List price must be at least the selling price");
      result = await db.from("product_variants").update({ price: data.price, mrp: data.mrp, stock: data.stock, is_active: data.active }).eq("id", data.id);
    } else if (data.action === "addReel") result = await db.from("reels").insert({ title: data.title, media_url: data.mediaUrl, caption: data.caption, is_published: data.published });
    else if (data.action === "toggleReel") result = await db.from("reels").update({ is_published: data.value }).eq("id", data.id);
    else result = await db.from("reels").delete().eq("id", data.id);
    if (result.error) throw result.error;
    return { ok: true };
  });