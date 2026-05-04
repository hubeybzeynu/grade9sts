// Returns whether a given device_link_id has been linked (the user pressed
// Start in the bot). Used by the website to show "linked" state if needed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    let deviceLinkId = url.searchParams.get("device_link_id") || "";
    if (!deviceLinkId && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      deviceLinkId = String(b?.device_link_id || "");
    }
    if (!deviceLinkId) {
      return new Response(JSON.stringify({ linked: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await supabase
      .from("telegram_links")
      .select("linked, telegram_username, telegram_first_name, linked_at")
      .eq("device_link_id", deviceLinkId)
      .maybeSingle();
    return new Response(JSON.stringify({
      linked: !!data?.linked,
      telegram_username: data?.telegram_username || null,
      telegram_first_name: data?.telegram_first_name || null,
      linked_at: data?.linked_at || null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("telegram-link-status error", e);
    return new Response(JSON.stringify({ linked: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
