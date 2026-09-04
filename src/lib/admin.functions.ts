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

const variantInput = z.object({
  label: z.string().trim().min(1).max(60),
  sku: z.string().trim().min(2).max(40),
  mrp: z.number().int().min(1),
  discount: z.number().min(0).max(90),
  stock: z.number().int().min(0),
});

export const mutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("orderStatus"), id: z.string().uuid(), value: z.enum(["new", "confirmed", "packed", "shipped", "delivered", "cancelled"]) }),
  z.object({ action: z.literal("reviewStatus"), id: z.string().uuid(), value: z.enum(["pending", "approved", "rejected"]) }),
  z.object({ action: z.literal("updateReview"), id: z.string().uuid(), customerName: z.string().trim().min(2).max(100), city: z.string().trim().max(100), rating: z.number().int().min(1).max(5), review: z.string().trim().min(2).max(2000), status: z.enum(["pending", "approved", "rejected"]) }),
  z.object({ action: z.literal("deleteReview"), id: z.string().uuid() }),
  z.object({ action: z.literal("messageStatus"), id: z.string().uuid(), value: z.enum(["unread", "read", "resolved"]) }),
  z.object({ action: z.literal("toggleProduct"), id: z.string().uuid(), value: z.boolean() }),
  z.object({ action: z.literal("updateVariant"), id: z.string().uuid(), price: z.number().int().min(0), mrp: z.number().int().min(0), stock: z.number().int().min(0), active: z.boolean() }),
  z.object({ action: z.literal("addReel"), title: z.string().min(2).max(120), mediaUrl: z.string().url(), caption: z.string().max(500), published: z.boolean() }),
  z.object({ action: z.literal("toggleReel"), id: z.string().uuid(), value: z.boolean() }),
  z.object({ action: z.literal("deleteReel"), id: z.string().uuid() }),
  z.object({
    action: z.literal("addProduct"),
    name: z.string().trim().min(2).max(120),
    shortName: z.string().trim().min(1).max(60),
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes").min(2).max(80),
    description: z.string().trim().max(2000),
    imageUrl: z.string().max(500).refine((value) => value === "" || value.startsWith("/api/public/product-image?path="), "Upload a product image"),
    active: z.boolean(),
    variants: z.array(variantInput).min(1).max(8),
  }),
  z.object({
    action: z.literal("editProduct"),
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    shortName: z.string().trim().min(1).max(60),
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes").min(2).max(80),
    description: z.string().trim().max(2000),
    imageUrl: z.string().max(500).refine((value) => value === "" || value.startsWith("/api/public/product-image?path="), "Upload a product image"),
    active: z.boolean(),
  }),
  variantInput.extend({ action: z.literal("addVariant"), productId: z.string().uuid() }),
  z.object({ action: z.literal("deleteVariant"), id: z.string().uuid() }),
  z.object({ action: z.literal("deleteProduct"), id: z.string().uuid() }),
]);

function sellingPrice(mrp: number, discount: number) {
  return Math.max(1, Math.round(mrp * (1 - discount / 100)));
}


export type AdminMutation = z.infer<typeof mutationSchema>;

export const mutateAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => mutationSchema.parse(input))
  .handler(async ({ context, data }) => {
    const db = await getAdminClientFor(context.userId);
    let result;
    if (data.action === "orderStatus") result = await db.from("orders").update({ status: data.value }).eq("id", data.id);
    else if (data.action === "reviewStatus") result = await db.from("reviews").update({ status: data.value }).eq("id", data.id);
    else if (data.action === "updateReview") result = await db.from("reviews").update({ customer_name: data.customerName, city: data.city, rating: data.rating, review: data.review, status: data.status }).eq("id", data.id);
    else if (data.action === "deleteReview") result = await db.from("reviews").delete().eq("id", data.id);
    else if (data.action === "messageStatus") result = await db.from("customer_messages").update({ status: data.value }).eq("id", data.id);
    else if (data.action === "toggleProduct") result = await db.from("products").update({ is_active: data.value }).eq("id", data.id);
    else if (data.action === "updateVariant") {
      if (data.mrp < data.price) throw new Error("List price must be at least the selling price");
      result = await db.from("product_variants").update({ price: data.price, mrp: data.mrp, stock: data.stock, is_active: data.active }).eq("id", data.id);
    } else if (data.action === "addReel") result = await db.from("reels").insert({ title: data.title, media_url: data.mediaUrl, caption: data.caption, is_published: data.published });
    else if (data.action === "toggleReel") result = await db.from("reels").update({ is_published: data.value }).eq("id", data.id);
    else if (data.action === "deleteReel") result = await db.from("reels").delete().eq("id", data.id);
    else if (data.action === "addProduct") {
      const { data: created, error } = await db.from("products").insert({
        name: data.name, short_name: data.shortName, slug: data.slug, description: data.description,
        image_url: data.imageUrl || null, is_active: data.active,
      }).select("id").single();
      if (error) throw error;
      result = await db.from("product_variants").insert(data.variants.map((variant, index) => ({
        product_id: created.id, sku: variant.sku, label: variant.label, mrp: variant.mrp,
        price: sellingPrice(variant.mrp, variant.discount), stock: variant.stock, sort_order: index,
      })));
      if (result.error) {
        await db.from("products").delete().eq("id", created.id);
        throw result.error;
      }
    } else if (data.action === "addVariant") {
      result = await db.from("product_variants").insert({
        product_id: data.productId, sku: data.sku, label: data.label, mrp: data.mrp,
        price: sellingPrice(data.mrp, data.discount), stock: data.stock,
      });
    } else if (data.action === "deleteVariant") result = await db.from("product_variants").delete().eq("id", data.id);
    else {
      await db.from("product_variants").delete().eq("product_id", data.id);
      result = await db.from("products").delete().eq("id", data.id);
    }

    if (result.error) throw result.error;
    return { ok: true };
  });