import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("The storefront database is unavailable");

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getApprovedReviews = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await publicClient()
      .from("reviews")
      .select("id,customer_name,city,rating,review")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("[Storefront reviews]", error);
    return [];
  }
});