import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";
const PORTAL_URL = "https://grade9sts.lovable.app";

const EXT_URL = "https://vcmyxcfdecpmcfpkdony.supabase.co";
const EXT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXl4Y2ZkZWNwbWNmcGtkb255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjk1NDgsImV4cCI6MjA4OTk0NTU0OH0.n7oK07eaQl9RpFbKqCUMVODnyxzUFrjdN1yJsM6yQLE";

// Context markers embedded in bot messages to detect what the user is replying to
const CTX_MID_ID = "📝 Mid Exam Results\n\nType your student ID number:";
const CTX_FINAL_ID = "📋 Final Exam Results\n\nType your student ID number:";
const CTX_CARD_ID = "🎓 Report Card\n\nType your student ID number:";
const CTX_RESULTS_ID = "📊 Ministry Exam Results\n\nType your name in Amharic or English:";
const CTX_MID_PW = "🔒 Password required for mid results";
const CTX_FINAL_PW = "🔒 Password required for final results";
const CTX_CARD_PW = "🔒 Password required for report card";
const CTX_TB_PREFIX = "📚 Type the number to view content.";
const CTX_STUDENTS = "👥 Student Directory\n\nType a student ID (1-98) or name to search:";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!BOT_TOKEN) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const extSupabase = createClient(EXT_URL, EXT_KEY);

  const url = new URL(req.url);
  if (url.searchParams.get("setup") === "true") {
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-bot`;
    const res = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const update = await req.json();
    const message = update.message;
    const callbackQuery = update.callback_query;
    const chatId = message?.chat?.id || callbackQuery?.message?.chat?.id;
    const text = message?.text?.trim() || "";
    const callbackData = callbackQuery?.data;
    const callbackMessageId = callbackQuery?.message?.message_id;
    const replyToText = message?.reply_to_message?.text || "";

    if (!chatId) return new Response("OK");

    // ----- Telegram helpers (defined first so the linking gate can use them) -----
    const escapeHtml = (s: string) =>
      String(s ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
      );

    const send = async (cid: number, txt: string, opts: any = {}) => {
      const res = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: cid, text: txt, parse_mode: "HTML", ...opts }),
      });
      return await res.json();
    };

    const sendForceReply = async (cid: number, txt: string, opts: any = {}) => {
      return await send(cid, txt, { ...opts, reply_markup: { force_reply: true, selective: true } });
    };

    const editMessage = async (cid: number, mid: number, txt: string, opts: any = {}) => {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: cid, message_id: mid, text: txt, parse_mode: "HTML", ...opts }),
      });
    };

    const sendPhoto = async (cid: number, photo: string, caption?: string, opts: any = {}) => {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: cid, photo, caption, parse_mode: "HTML", ...opts }),
      });
    };

    const mainMenuKeyboard = {
      inline_keyboard: [
        [{ text: "📚 Textbooks", callback_data: "menu_textbooks" }, { text: "👥 Students", callback_data: "menu_students" }],
        [{ text: "📝 Mid Exam", callback_data: "menu_mid" }, { text: "📋 Final Exam", callback_data: "menu_final" }],
        [{ text: "🎓 Report Card", callback_data: "menu_reportcard" }, { text: "📊 Ministry Results", callback_data: "menu_results" }],
        [{ text: "🌐 Open Portal", url: PORTAL_URL }],
      ],
    };

    const SUBJECTS = ['Amharic', 'English', 'Mathematics', 'General Science', 'Social Studies',
      'Citizenship Education', 'Performing & Visual Arts', 'Information Technology',
      'Health & Physical Education', 'Career & Technical Education'];

    const textbooksList = [
      { key: "mathematics", name: "📐 Mathematics" },
      { key: "chemistry", name: "🧪 Chemistry" },
      { key: "biology", name: "🧬 Biology" },
      { key: "economics", name: "💰 Economics" },
      { key: "hpe", name: "🏃 HPE" },
      { key: "amharic", name: "📖 Amharic" },
    ];

    // ============ LINKING GATE ============
    // Every chat must be linked to a website visitor (Google account) via the
    // ?start=<deviceId> deep link. Without it the bot does nothing.
    const fromUser = message?.from || callbackQuery?.from;
    const tgUsername = fromUser?.username || "";
    const tgFirstName = fromUser?.first_name || "";
    const tgLastName = fromUser?.last_name || "";
    const tgFullName = [tgFirstName, tgLastName].filter(Boolean).join(" ") || "Telegram user";

    const notifyAdmin = async (txt: string) => {
      const adminChat = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");
      if (!adminChat) return;
      try {
        await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminChat, text: txt, parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
      } catch (e) { console.error("notifyAdmin failed", e); }
    };

    // Handle /start <payload> — link this chat to the website visitor.
    if (text.startsWith("/start")) {
      const parts = text.split(/\s+/);
      const payload = parts[1] || "";
      if (payload) {
        const { data: pending } = await supabase
          .from("telegram_links")
          .select("*")
          .eq("device_link_id", payload)
          .maybeSingle();
        if (pending) {
          const wasAlreadyLinked = !!pending.linked && pending.telegram_chat_id === chatId;
          await supabase.from("telegram_links")
            .update({
              telegram_chat_id: chatId,
              telegram_username: tgUsername || null,
              telegram_first_name: tgFullName,
              linked: true,
              linked_at: new Date().toISOString(),
            })
            .eq("device_link_id", payload);

          await send(chatId,
            `✅ <b>Connected!</b>\n\n` +
            `Welcome <b>${escapeHtml(tgFullName)}</b>!\n\n` +
            `🏫 This is the <b>ቅዱስ ቴሬዛ Grade 9 Portal</b> bot. You can now access:\n` +
            `• 📚 Textbooks & content\n` +
            `• 👥 Student directory\n` +
            `• 📝 Mid & 📋 final exam results\n` +
            `• 🎓 Report cards\n` +
            `• 📊 Ministry results\n\n` +
            `Tap a button below to begin.`,
            { reply_markup: mainMenuKeyboard },
          );

          if (!wasAlreadyLinked) {
            await notifyAdmin(
              `🔗 <b>Telegram linked to website user</b>\n\n` +
              `👤 <b>Google name:</b> ${escapeHtml(pending.user_name || "(unknown)")}\n` +
              `📧 <b>Google email:</b> ${escapeHtml(pending.user_email || "(unknown)")}\n` +
              `💬 <b>Telegram:</b> ${escapeHtml(tgFullName)}` +
                (tgUsername ? ` (@${escapeHtml(tgUsername)})` : "") +
              `\n🆔 <b>Chat ID:</b> <code>${chatId}</code>`,
            );
          }
          return new Response("OK");
        }
      }

      // /start without a valid payload — only allow if this chat is already linked.
      const { data: existing } = await supabase
        .from("telegram_links")
        .select("linked")
        .eq("telegram_chat_id", chatId)
        .eq("linked", true)
        .maybeSingle();
      if (!existing) {
        await send(chatId,
          `🔒 <b>Access restricted</b>\n\n` +
          `This bot only works for visitors of the <b>ቅዱስ ቴሬዛ Grade 9 Portal</b>.\n\n` +
          `👉 Please open the website first, sign in with Google, then tap <b>“Get Started”</b>. ` +
          `That button will bring you back here automatically and unlock the bot.\n\n` +
          `🌐 ${PORTAL_URL}`,
          {
            reply_markup: { inline_keyboard: [[{ text: "🌐 Open Portal", url: PORTAL_URL }]] },
          },
        );
        return new Response("OK");
      }
      // Already linked — fall through to normal /start menu below.
    }

    // For ALL other messages: ensure this chat is linked.
    {
      const { data: linkedRow } = await supabase
        .from("telegram_links")
        .select("linked")
        .eq("telegram_chat_id", chatId)
        .eq("linked", true)
        .maybeSingle();
      if (!linkedRow) {
        await send(chatId,
          `🔒 You need to connect via the website first.\n\n` +
          `Open ${PORTAL_URL}, sign in with Google, then tap <b>“Get Started”</b>.`,
          {
            reply_markup: { inline_keyboard: [[{ text: "🌐 Open Portal", url: PORTAL_URL }]] },
          },
        );
        return new Response("OK");
      }
    }

    if (callbackQuery) {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQuery.id }),
      });
    }


    // ============ REPLY-BASED CONTEXT DETECTION ============
    // If user is replying to a bot message, detect context from that message
    if (text && replyToText) {
      // Mid exam - user typed ID
      if (replyToText.includes(CTX_MID_ID)) {
        const idNum = text.match(/^(\d+)$/);
        if (!idNum) {
          await sendForceReply(chatId, CTX_MID_ID);
          return new Response("OK");
        }
        await handleMidResults(chatId, idNum[1]);
        return new Response("OK");
      }

      // Mid exam - user typed password
      if (replyToText.includes(CTX_MID_PW)) {
        const sidMatch = replyToText.match(/student_id:(\d+)/);
        if (sidMatch) {
          await handlePasswordUnlock(chatId, "mid", sidMatch[1], text);
        }
        return new Response("OK");
      }

      // Final exam - user typed ID
      if (replyToText.includes(CTX_FINAL_ID)) {
        const idNum = text.match(/^(\d+)$/);
        if (!idNum) {
          await sendForceReply(chatId, CTX_FINAL_ID);
          return new Response("OK");
        }
        await handleFinalResults(chatId, idNum[1]);
        return new Response("OK");
      }

      // Final exam - user typed password
      if (replyToText.includes(CTX_FINAL_PW)) {
        const sidMatch = replyToText.match(/student_id:(\d+)/);
        if (sidMatch) {
          await handlePasswordUnlock(chatId, "final", sidMatch[1], text);
        }
        return new Response("OK");
      }

      // Report card - user typed ID
      if (replyToText.includes(CTX_CARD_ID)) {
        const idNum = text.match(/^(\d+)$/);
        if (!idNum) {
          await sendForceReply(chatId, CTX_CARD_ID);
          return new Response("OK");
        }
        await handleReportCard(chatId, idNum[1]);
        return new Response("OK");
      }

      // Report card - user typed password
      if (replyToText.includes(CTX_CARD_PW)) {
        const sidMatch = replyToText.match(/student_id:(\d+)/);
        if (sidMatch) {
          await handleCardPasswordUnlock(chatId, sidMatch[1], text);
        }
        return new Response("OK");
      }

      // Ministry results - user typed name (forget ID)
      if (replyToText.includes(CTX_RESULTS_ID)) {
        await handleMinistryNameSearch(chatId, text);
        return new Response("OK");
      }

      // Textbook content - user typed number
      if (replyToText.includes(CTX_TB_PREFIX)) {
        const tbMatch = replyToText.match(/tb_key:(\w+)\|cat:(\w+)/);
        if (tbMatch) {
          await handleTextbookContent(chatId, tbMatch[1], tbMatch[2], text);
        }
        return new Response("OK");
      }

      // Students search
      if (replyToText.includes(CTX_STUDENTS)) {
        await handleStudentSearch(chatId, text);
        return new Response("OK");
      }
    }

    // ============ MAIN MENU ============
    if (text === "/start" || callbackData === "menu_start") {
      const msg = `🏫 <b>ቅዱስ ቴሬዛ ት/ቤት - Student Portal Bot</b>\n\nWelcome! Choose an option:`;
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: mainMenuKeyboard });
      } else {
        await send(chatId, msg, { reply_markup: mainMenuKeyboard });
      }
      return new Response("OK");
    }

    // ============ TEXTBOOKS ============
    if (callbackData === "menu_textbooks") {
      const kb = {
        inline_keyboard: [
          ...textbooksList.map(t => [{ text: t.name, callback_data: `tb_${t.key}` }]),
          [{ text: "◀️ Back", callback_data: "menu_start" }],
        ],
      };
      const msg = `📚 <b>Grade 9 Textbooks</b>\n\nSelect a textbook:`;
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // Textbook selected
    const tbSelect = callbackData?.match(/^tb_(\w+)$/);
    if (tbSelect) {
      const tbKey = tbSelect[1];
      const tbName = textbooksList.find(t => t.key === tbKey)?.name || tbKey;
      const kb = {
        inline_keyboard: [
          [{ text: "📝 Activities", callback_data: `tbc_${tbKey}_activities` }],
          [{ text: "📋 Exercises", callback_data: `tbc_${tbKey}_exercises` }],
          [{ text: "📖 Review Exercises", callback_data: `tbc_${tbKey}_review` }],
          [{ text: "◀️ Back", callback_data: "menu_textbooks" }],
        ],
      };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, `${tbName}\n\nChoose content type:`, { reply_markup: kb });
      } else {
        await send(chatId, `${tbName}\n\nChoose content type:`, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // Textbook content category - ask for number with force_reply
    const tbcSelect = callbackData?.match(/^tbc_(\w+)_(activities|exercises|review)$/);
    if (tbcSelect) {
      const tbKey = tbcSelect[1];
      const category = tbcSelect[2];
      const catLabel = category === 'activities' ? 'Activities' : category === 'exercises' ? 'Exercises' : 'Review Exercises';
      const tbName = textbooksList.find(t => t.key === tbKey)?.name || tbKey;
      // Include hidden context for reply detection
      const msg = `${tbName} - ${catLabel}\n\n${CTX_TB_PREFIX}\nExample: 4.1\n\ntb_key:${tbKey}|cat:${category}`;
      await sendForceReply(chatId, msg);
      return new Response("OK");
    }

    // ============ STUDENTS ============
    if (callbackData === "menu_students") {
      await sendForceReply(chatId, CTX_STUDENTS);
      return new Response("OK");
    }

    // ============ MID EXAM ============
    if (callbackData === "menu_mid") {
      await sendForceReply(chatId, CTX_MID_ID);
      return new Response("OK");
    }

    // ============ FINAL EXAM ============
    if (callbackData === "menu_final") {
      await sendForceReply(chatId, CTX_FINAL_ID);
      return new Response("OK");
    }

    // ============ REPORT CARD ============
    if (callbackData === "menu_reportcard") {
      await sendForceReply(chatId, CTX_CARD_ID);
      return new Response("OK");
    }

    // ============ MINISTRY RESULTS (with forget ID) ============
    if (callbackData === "menu_results") {
      await sendForceReply(chatId, CTX_RESULTS_ID);
      return new Response("OK");
    }

    // ============ STUDENT DETAIL CALLBACKS ============
    const quickMid = callbackData?.match(/^quick_mid_(\d+)$/);
    if (quickMid) { await handleMidResults(chatId, quickMid[1]); return new Response("OK"); }

    const quickFinal = callbackData?.match(/^quick_final_(\d+)$/);
    if (quickFinal) { await handleFinalResults(chatId, quickFinal[1]); return new Response("OK"); }

    const quickCard = callbackData?.match(/^quick_card_(\d+)$/);
    if (quickCard) { await handleReportCard(chatId, quickCard[1]); return new Response("OK"); }

    const studentCb = callbackData?.match(/^student_(\d+)$/);
    if (studentCb) {
      const sid = parseInt(studentCb[1]);
      const { data: student } = await supabase.from("students").select("*").eq("id", sid).single();
      if (!student) {
        await editMessage(chatId, callbackMessageId!, `❌ Student not found.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return new Response("OK");
      }
      const info = `👤 <b>${student.name}</b>\n🔤 ${student.english_name}\n🆔 ID: ${student.id}\n📚 Section: ${student.section || 'N/A'}\n🎂 Age: ${student.age || 'N/A'}\n⚧ Gender: ${student.gender || 'N/A'}`;
      await editMessage(chatId, callbackMessageId!, info, {
        reply_markup: { inline_keyboard: [
          [{ text: "📝 Mid Results", callback_data: `quick_mid_${student.id}` }, { text: "📋 Final Results", callback_data: `quick_final_${student.id}` }],
          [{ text: "🎓 Report Card", callback_data: `quick_card_${student.id}` }],
          [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
        ]},
      });
      return new Response("OK");
    }

    // Answer image callbacks
    const answerMid = callbackData?.match(/^answer_mid_(.+)$/);
    if (answerMid) {
      const { data: result } = await extSupabase.from("mid_results").select("*").eq("id", answerMid[1]).single();
      if (result?.answer_image_url) await sendPhoto(chatId, result.answer_image_url, `📝 Answer Key`);
      else await send(chatId, `❌ No answer key available.`);
      return new Response("OK");
    }

    const answerFinal = callbackData?.match(/^answer_final_(.+)$/);
    if (answerFinal) {
      const { data: result } = await extSupabase.from("final_results").select("*").eq("id", answerFinal[1]).single();
      if (result?.answer_image_url) await sendPhoto(chatId, result.answer_image_url, `📝 Answer Key`);
      else await send(chatId, `❌ No answer key available.`);
      return new Response("OK");
    }

    // Ministry result callback (from name search)
    const ministrySelect = callbackData?.match(/^ministry_(\d+)$/);
    if (ministrySelect) {
      const ministryId = ministrySelect[1];
      await send(chatId, `📊 Ministry Result for ID <b>${ministryId}</b>\n\n📱 View full result on the portal:`, {
        reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Result Online", url: `${PORTAL_URL}?tab=results&id=${ministryId}` }],
          [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
        ]},
      });
      return new Response("OK");
    }

    // ============ FALLBACK: plain number = student lookup ============
    const idMatch = text.match(/^(\d{1,2})$/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const { data: student } = await supabase.from("students").select("*").eq("id", id).single();
      if (!student) { await send(chatId, `❌ No student found with ID ${id}.`); return new Response("OK"); }
      if (student.image_url) {
        const info = `👤 <b>${student.name}</b>\n🔤 ${student.english_name}\n🆔 ID: ${student.id}\n📚 Section: ${student.section || 'N/A'}\n🎂 Age: ${student.age || 'N/A'}\n⚧ Gender: ${student.gender || 'N/A'}`;
        await sendPhoto(chatId, student.image_url, info);
      }
      await send(chatId, `Quick actions for ${student.name}:`, {
        reply_markup: { inline_keyboard: [
          [{ text: "📝 Mid Results", callback_data: `quick_mid_${student.id}` }, { text: "📋 Final Results", callback_data: `quick_final_${student.id}` }],
          [{ text: "🎓 Report Card", callback_data: `quick_card_${student.id}` }],
          [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
        ]},
      });
      return new Response("OK");
    }

    // Name search fallback
    if (text.length >= 2 && !text.startsWith("/")) {
      await handleStudentSearch(chatId, text);
      return new Response("OK");
    }

    await send(chatId, `I didn't understand that. Try /start to see available options.`);
    return new Response("OK");

    // ============ HANDLER FUNCTIONS ============

    async function handleStudentSearch(cid: number, query: string) {
      const idNum = query.match(/^(\d{1,2})$/);
      if (idNum) {
        const id = parseInt(idNum[1]);
        const { data: student } = await supabase.from("students").select("*").eq("id", id).single();
        if (!student) { await send(cid, `❌ No student found with ID ${id}.`); return; }
        if (student.image_url) {
          const info = `👤 <b>${student.name}</b>\n🔤 ${student.english_name}\n🆔 ID: ${student.id}\n📚 Section: ${student.section || 'N/A'}\n🎂 Age: ${student.age || 'N/A'}\n⚧ Gender: ${student.gender || 'N/A'}`;
          await sendPhoto(cid, student.image_url, info);
        }
        await send(cid, `Quick actions for ${student.name}:`, {
          reply_markup: { inline_keyboard: [
            [{ text: "📝 Mid", callback_data: `quick_mid_${student.id}` }, { text: "📋 Final", callback_data: `quick_final_${student.id}` }],
            [{ text: "🎓 Report Card", callback_data: `quick_card_${student.id}` }],
            [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
          ]},
        });
        return;
      }

      if (query.length >= 2) {
        const { data: students } = await supabase.from("students").select("*")
          .or(`name.ilike.%${query}%,english_name.ilike.%${query}%`);
        if (students && students.length > 0) {
          const limited = students.slice(0, 5);
          let msg = `🔍 Found ${students.length} student(s):\n\n`;
          for (const s of limited) msg += `🆔 <b>${s.id}</b> - ${s.name} (${s.english_name})\n`;
          if (students.length > 5) msg += `\n... and ${students.length - 5} more`;
          msg += `\n\nType the ID number to see details.`;
          await send(cid, msg);
        } else {
          await send(cid, `❌ No students found matching "<b>${query}</b>".`);
        }
      }
    }

    async function handleMidResults(cid: number, studentId: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      if (!student) { await send(cid, `❌ Student with ID ${studentId} not found.`); return; }
      const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", studentId);
      if (!results || results.length === 0) {
        await send(cid, `📝 No mid results found for <b>${student.name}</b>.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }
      const unlocked = results.filter((r: any) => !r.student_password);
      const locked = results.filter((r: any) => r.student_password);
      for (const r of unlocked) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id}` }]);
          await sendPhoto(cid, r.result_image_url, `📝 Mid Result - ${student.name}`, { reply_markup: kb });
        }
      }
      if (locked.length > 0) {
        // Ask for password with force_reply, embed student_id for context
        await sendForceReply(cid, `${CTX_MID_PW}\nStudent: ${student.name}\n\nType the password:\n\nstudent_id:${studentId}`);
      } else {
        await send(cid, `✅ ${results.length} mid result(s) for ${student.name}`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
      }
    }

    async function handleFinalResults(cid: number, studentId: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      if (!student) { await send(cid, `❌ Student with ID ${studentId} not found.`); return; }
      const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", studentId);
      if (!results || results.length === 0) {
        await send(cid, `📋 No final results found for <b>${student.name}</b>.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }
      const unlocked = results.filter((r: any) => !r.student_password);
      const locked = results.filter((r: any) => r.student_password);
      for (const r of unlocked) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id}` }]);
          await sendPhoto(cid, r.result_image_url, `📋 Final Result - ${student.name}`, { reply_markup: kb });
        }
      }
      if (locked.length > 0) {
        await sendForceReply(cid, `${CTX_FINAL_PW}\nStudent: ${student.name}\n\nType the password:\n\nstudent_id:${studentId}`);
      } else {
        await send(cid, `✅ ${results.length} final result(s) for ${student.name}`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
      }
    }

    async function handleReportCard(cid: number, studentId: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      if (!student) { await send(cid, `❌ Student with ID ${studentId} not found.`); return; }
      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();
      if (!card) {
        await send(cid, `🎓 No report card found for <b>${student.name}</b>.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }
      if (card.card_password) {
        await sendForceReply(cid, `${CTX_CARD_PW}\nStudent: ${student.name}\n\nType the password:\n\nstudent_id:${studentId}`);
        return;
      }
      await sendReportCardDetails(cid, card, student, studentId);
    }

    async function handlePasswordUnlock(cid: number, type: string, studentId: string, password: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const table = type === "mid" ? "mid_results" : "final_results";
      const emoji = type === "mid" ? "📝" : "📋";
      const { data: results } = await extSupabase.from(table).select("*").eq("student_id", studentId);
      if (!results) { await send(cid, `❌ No results found.`); return; }
      const locked = results.filter((r: any) => r.student_password);
      const matched = locked.filter((r: any) => r.student_password === password);
      if (matched.length === 0) {
        const ctxPw = type === "mid" ? CTX_MID_PW : CTX_FINAL_PW;
        await sendForceReply(cid, `❌ Incorrect password. Try again.\n\n${ctxPw}\n\nstudent_id:${studentId}`);
        return;
      }
      for (const r of matched) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_${type}_${r.id}` }]);
          await sendPhoto(cid, r.result_image_url, `🔓 ${emoji} ${type === 'mid' ? 'Mid' : 'Final'} Result - ${student?.name}`, { reply_markup: kb });
        }
      }
    }

    async function handleCardPasswordUnlock(cid: number, studentId: string, password: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();
      if (!card) { await send(cid, `🎓 No report card found.`); return; }
      if (card.card_password && card.card_password !== password) {
        await sendForceReply(cid, `❌ Incorrect password. Try again.\n\n${CTX_CARD_PW}\n\nstudent_id:${studentId}`);
        return;
      }
      await sendReportCardDetails(cid, card, student, studentId);
    }

    async function handleMinistryNameSearch(cid: number, nameQuery: string) {
      // Search students by name
      const { data: students } = await supabase.from("students").select("*")
        .or(`name.ilike.%${nameQuery}%,english_name.ilike.%${nameQuery}%`);
      
      if (!students || students.length === 0) {
        await send(cid, `❌ No students found matching "<b>${nameQuery}</b>".\n\nTry again with a different spelling.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }

      if (students.length === 1) {
        const s = students[0];
        await send(cid, `📊 Found: <b>${s.name}</b> (${s.english_name})\nID: ${s.id}\n\n📱 View result on portal:`, {
          reply_markup: { inline_keyboard: [
            [{ text: "🌐 View Ministry Result", url: `${PORTAL_URL}?tab=results` }],
            [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
          ]},
        });
      } else {
        const limited = students.slice(0, 5);
        let msg = `🔍 Found ${students.length} student(s):\n\n`;
        for (const s of limited) {
          msg += `🆔 <b>${s.id}</b> - ${s.name} (${s.english_name})\n`;
        }
        msg += `\n📱 View ministry results on the portal:`;
        await send(cid, msg, {
          reply_markup: { inline_keyboard: [
            [{ text: "🌐 View Results Online", url: `${PORTAL_URL}?tab=results` }],
            [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
          ]},
        });
      }
    }

    async function handleTextbookContent(cid: number, tbKey: string, category: string, numberInput: string) {
      const catLabel = category === 'activities' ? 'Activity' : category === 'exercises' ? 'Exercise' : 'Review Exercise';
      const searchId = `${catLabel} ${numberInput.trim()}`;
      
      await send(cid, `📚 <b>${searchId}</b> - ${tbKey}\n\n📱 Open the textbook on the portal to view the full content with the Content Finder:`, {
        reply_markup: { inline_keyboard: [
          [{ text: "🌐 Open Textbook", url: `${PORTAL_URL}?tab=textbooks` }],
          [{ text: "◀️ Back", callback_data: `tb_${tbKey}` }],
        ]},
      });
    }

    async function sendReportCardDetails(cid: number, card: any, student: any, studentId: string) {
      const subjects = card.subjects as any;
      let msg = `🎓 <b>Report Card - ${card.student_name || student?.name}</b>\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `📋 Grade: ${card.grade || 'N/A'} | Section: ${student?.section || 'N/A'}\n`;
      msg += `📅 School Year: ${card.school_year || 'N/A'}\n`;
      msg += `👤 Sex: ${card.sex || 'N/A'} | Age: ${card.age || student?.age || 'N/A'}\n\n`;

      const QS = ['1st', '2nd', '3rd', '4th'];
      if (subjects && typeof subjects === 'object') {
        // Per-quarter totals
        const qTotals: Record<string, number | null> = {};
        const qCounts: Record<string, number> = {};
        for (const q of QS) { qTotals[q] = null; qCounts[q] = 0; }
        let totalAvg = 0, subCount = 0, failCount = 0;

        msg += `📚 <b>Subjects (avg across quarters):</b>\n`;
        for (const subj of SUBJECTS) {
          const marks = subjects[subj];
          if (!marks) continue;
          const vals: number[] = [];
          for (const q of QS) {
            const v = marks[q];
            if (v != null) {
              vals.push(v);
              qTotals[q] = (qTotals[q] ?? 0) + v;
              qCounts[q]++;
            }
          }
          if (vals.length === 0) continue;
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          totalAvg += avg; subCount++; if (avg < 60) failCount++;
          msg += `${avg < 60 ? '🔴' : '🟢'} ${subj}: ${avg.toFixed(1)}\n`;
        }

        // Per-quarter summary block
        msg += `\n📅 <b>Per Quarter:</b>\n`;
        const completedQuarters: string[] = [];
        for (const q of QS) {
          const total = qTotals[q];
          if (total == null || qCounts[q] === 0) {
            msg += `• <b>${q}</b>: — (not released)\n`;
            continue;
          }
          completedQuarters.push(q);
          const qAvg = total / SUBJECTS.length;
          const rank = card.rank?.[q] ?? '-';
          msg += `• <b>${q}</b>: avg ${qAvg.toFixed(1)} | total ${total} | rank ${rank}\n`;
        }

        if (subCount > 0) {
          const overallAvg = totalAvg / subCount;
          const overallTotal = Object.values(qTotals).filter(v => v != null).reduce((a: number, b) => a + (b as number), 0);
          msg += `\n📊 <b>Total Score:</b> ${overallTotal}`;
          msg += `\n📈 <b>Total Average:</b> ${overallAvg.toFixed(1)}`;
          if (card.total_students) msg += `\n👥 <b>Class Size:</b> ${card.total_students}`;

          // Promotion only when ALL 4 quarters complete
          const isComplete = completedQuarters.length === QS.length;
          if (isComplete) {
            const promoted = failCount < 2;
            const gradeNum = card.grade ? parseInt(card.grade.replace(/\D/g, '')) : 9;
            msg += `\n\n${promoted ? `✅ <b>Promoted to Grade ${gradeNum + 1}</b>` : `❌ <b>Detained in Grade ${gradeNum}</b>`}`;
          } else {
            msg += `\n\n⏳ <i>Results in progress (${completedQuarters.length}/4 quarters). Promotion status will appear once all quarters are complete.</i>`;
          }
        }
      }

      await send(cid, msg, {
        reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Full Card Online", url: `${PORTAL_URL}?tab=reportcard` }],
          [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
        ]},
      });
    }

  } catch (e) {
    console.error("Telegram bot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
