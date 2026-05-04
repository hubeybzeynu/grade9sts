// Records a pending link between a website visitor (Google account) and a
// Telegram chat. Called by the frontend right before "Get Started" opens the
// bot deep link. Stores the row keyed by device_link_id (the ?start= payload).
// Also notifies the admin via Telegram with the user's Google name + email.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const deviceLinkId = String(body?.device_link_id || "").trim();
    const userEmail = String(body?.user_email || "").trim().slice(0, 255);
    const userName = String(body?.user_name || "").trim().slice(0, 200);

    if (!deviceLinkId) {
      return new Response(JSON.stringify({ error: "device_link_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert the pending link row. linked stays false until the user starts the bot.
    await supabase.from("telegram_links").upsert(
      {
        device_link_id: deviceLinkId,
        user_email: userEmail || null,
        user_name: userName || null,
      },
      { onConflict: "device_link_id" },
    );

    // Notify admin with Google account info.
    const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TG_CHAT = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");
    if (TG_TOKEN && TG_CHAT) {
      const text =
        `🟢 <b>New visitor opened the bot link</b>\n\n` +
        `👤 <b>Name:</b> ${escapeHtml(userName || "(unknown)")}\n` +
        `📧 <b>Email:</b> ${escapeHtml(userEmail || "(unknown)")}\n` +
        `🔗 <b>Link ID:</b> <code>${escapeHtml(deviceLinkId)}</code>\n\n` +
        `Waiting for them to press Start in the bot…`;
      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG_CHAT, text, parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("telegram-link error", e);
    return new Response(JSON.stringify({ error: "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
