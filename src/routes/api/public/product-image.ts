import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/product-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path");
        if (!path || path.includes("..") || path.startsWith("/")) {
          return new Response("Invalid image path", { status: 400 });
        }

        const imageUrl = `/api/public/product-image?path=${encodeURIComponent(path)}`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("id")
          .eq("image_url", imageUrl)
          .eq("is_active", true)
          .maybeSingle();

        if (!product) return new Response("Image not found", { status: 404 });

        const { data, error } = await supabaseAdmin.storage.from("product-images").download(path);
        if (error || !data) return new Response("Image not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});