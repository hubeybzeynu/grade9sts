import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";
const PORTAL_URL = "https://grade9sts.lovable.app";

// External Supabase for mid/final results
const EXT_URL = "https://vcmyxcfdecpmcfpkdony.supabase.co";
const EXT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXl4Y2ZkZWNwbWNmcGtkb255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjk1NDgsImV4cCI6MjA4OTk0NTU0OH0.n7oK07eaQl9RpFbKqCUMVODnyxzUFrjdN1yJsM6yQLE";

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

  // Check if this is a webhook setup request
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
    const message = update.message || update.callback_query?.message;
    const callbackData = update.callback_query?.data;
    const chatId = message?.chat?.id || update.callback_query?.message?.chat?.id;
    const text = message?.text?.trim() || "";

    if (!chatId) return new Response("OK");

    // Answer callback query to remove loading
    if (update.callback_query) {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: update.callback_query.id }),
      });
    }

    const send = async (chatId: number, text: string, opts: any = {}) => {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...opts }),
      });
    };

    const sendPhoto = async (chatId: number, photo: string, caption?: string) => {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo, caption, parse_mode: "HTML" }),
      });
    };

    // Handle /start command
    if (text === "/start") {
      await send(chatId, 
        `🏫 <b>ቅዱስ ቴሬዛ ት/ቤት - Student Portal Bot</b>\n\n` +
        `Welcome! Here's what I can do:\n\n` +
        `📚 /textbooks - View Grade 9 Textbooks\n` +
        `👥 /students - Search Student Directory\n` +
        `📊 /results - Ministry Exam Results\n` +
        `📝 /mid - Mid Exam Results\n` +
        `📋 /final - Final Exam Results\n` +
        `🎓 /reportcard - Report Card\n` +
        `🌐 /portal - Open Web Portal\n\n` +
        `Type a student ID number to see their info!`,
        { reply_markup: { inline_keyboard: [
          [{ text: "📚 Textbooks", callback_data: "menu_textbooks" }, { text: "👥 Students", callback_data: "menu_students" }],
          [{ text: "📝 Mid Exam", callback_data: "menu_mid" }, { text: "📋 Final Exam", callback_data: "menu_final" }],
          [{ text: "🎓 Report Card", callback_data: "menu_reportcard" }, { text: "📊 Results", callback_data: "menu_results" }],
          [{ text: "🌐 Open Portal", url: PORTAL_URL }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle /textbooks
    if (text === "/textbooks" || callbackData === "menu_textbooks") {
      const textbooks = [
        { name: "📐 Mathematics", file: "G9-Mathematics" },
        { name: "🧪 Chemistry", file: "G9-Chemistry" },
        { name: "🧬 Biology", file: "G9-Biology" },
        { name: "💰 Economics", file: "G9-Economics" },
        { name: "🏃 HPE", file: "G9-HPE" },
        { name: "📖 Amharic", file: "Amharic-G9" },
      ];
      await send(chatId, 
        `📚 <b>Grade 9 Textbooks</b>\n\nSelect a textbook to view on the portal:`,
        { reply_markup: { inline_keyboard: textbooks.map(t => 
          [{ text: t.name, url: `${PORTAL_URL}?tab=textbooks` }]
        ).concat([[{ text: "◀️ Back to Menu", callback_data: "menu_start" }]])}}
      );
      return new Response("OK");
    }

    // Handle /students or search
    if (text === "/students" || callbackData === "menu_students") {
      await send(chatId,
        `👥 <b>Student Directory</b>\n\n` +
        `Send a student's ID number (1-98) to see their info.\n` +
        `Or send their name in Amharic or English to search.\n\n` +
        `Example: <code>5</code> or <code>Hubeyb</code>`,
        { reply_markup: { inline_keyboard: [
          [{ text: "🌐 View All Online", url: `${PORTAL_URL}?tab=students` }],
          [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle /mid
    if (text === "/mid" || callbackData === "menu_mid") {
      await send(chatId,
        `📝 <b>Mid Exam Results</b>\n\n` +
        `Send your student ID to check mid exam results.\n` +
        `Format: <code>mid 5</code>\n\n` +
        `Or view online:`,
        { reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Mid Results Online", url: `${PORTAL_URL}?tab=mid` }],
          [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle /final
    if (text === "/final" || callbackData === "menu_final") {
      await send(chatId,
        `📋 <b>Final Exam Results</b>\n\n` +
        `Send your student ID to check final exam results.\n` +
        `Format: <code>final 5</code>\n\n` +
        `Or view online:`,
        { reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Final Results Online", url: `${PORTAL_URL}?tab=final` }],
          [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle /reportcard
    if (text === "/reportcard" || callbackData === "menu_reportcard") {
      await send(chatId,
        `🎓 <b>Report Card</b>\n\n` +
        `Send your student ID to check your report card.\n` +
        `Format: <code>card 5</code>\n\n` +
        `Or view online:`,
        { reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Report Card Online", url: `${PORTAL_URL}?tab=reportcard` }],
          [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle /results
    if (text === "/results" || callbackData === "menu_results") {
      await send(chatId,
        `📊 <b>Ministry Exam Results</b>\n\n` +
        `Send your ministry ID to check results.\n` +
        `Format: <code>result 219335</code>\n\n` +
        `Or view online:`,
        { reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Results Online", url: `${PORTAL_URL}?tab=results` }],
          [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle /portal
    if (text === "/portal") {
      await send(chatId, `🌐 <b>Open the Student Portal:</b>\n${PORTAL_URL}`);
      return new Response("OK");
    }

    // Handle back to menu
    if (callbackData === "menu_start") {
      await send(chatId,
        `🏫 <b>Main Menu</b>\n\nChoose an option:`,
        { reply_markup: { inline_keyboard: [
          [{ text: "📚 Textbooks", callback_data: "menu_textbooks" }, { text: "👥 Students", callback_data: "menu_students" }],
          [{ text: "📝 Mid Exam", callback_data: "menu_mid" }, { text: "📋 Final Exam", callback_data: "menu_final" }],
          [{ text: "🎓 Report Card", callback_data: "menu_reportcard" }, { text: "📊 Results", callback_data: "menu_results" }],
          [{ text: "🌐 Open Portal", url: PORTAL_URL }],
        ]}}
      );
      return new Response("OK");
    }

    // Handle "mid [id]" command
    const midMatch = text.match(/^mid\s+(\d+)$/i);
    if (midMatch) {
      const studentId = midMatch[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      if (!student) {
        await send(chatId, `❌ Student with ID ${studentId} not found.`);
        return new Response("OK");
      }

      const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", studentId);
      if (!results || results.length === 0) {
        await send(chatId, `📝 No mid exam results found for <b>${student.name}</b> (ID: ${studentId}).`);
        return new Response("OK");
      }

      await send(chatId, `📝 <b>Mid Exam Results for ${student.name}</b>\nID: ${studentId} | ${results.length} result(s) found:`);
      for (const r of results) {
        if (r.result_image_url) {
          await sendPhoto(chatId, r.result_image_url, `📝 Mid Result - ${student.name}`);
        }
      }
      return new Response("OK");
    }

    // Handle "final [id]" command
    const finalMatch = text.match(/^final\s+(\d+)$/i);
    if (finalMatch) {
      const studentId = finalMatch[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      if (!student) {
        await send(chatId, `❌ Student with ID ${studentId} not found.`);
        return new Response("OK");
      }

      const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", studentId);
      if (!results || results.length === 0) {
        await send(chatId, `📋 No final exam results found for <b>${student.name}</b> (ID: ${studentId}).`);
        return new Response("OK");
      }

      await send(chatId, `📋 <b>Final Exam Results for ${student.name}</b>\nID: ${studentId} | ${results.length} result(s) found:`);
      for (const r of results) {
        if (r.result_image_url) {
          await sendPhoto(chatId, r.result_image_url, `📋 Final Result - ${student.name}`);
        }
      }
      return new Response("OK");
    }

    // Handle "card [id]" command
    const cardMatch = text.match(/^card\s+(\d+)$/i);
    if (cardMatch) {
      const studentId = cardMatch[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      if (!student) {
        await send(chatId, `❌ Student with ID ${studentId} not found.`);
        return new Response("OK");
      }

      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();
      if (!card) {
        await send(chatId, `🎓 No report card found for <b>${student.name}</b> (ID: ${studentId}).`);
        return new Response("OK");
      }

      // Build report card text
      let msg = `🎓 <b>Report Card - ${card.student_name || student.name}</b>\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `📋 Grade: ${card.grade || 'N/A'} | Section: ${student.section}\n`;
      msg += `📅 School Year: ${card.school_year || 'N/A'}\n`;
      msg += `👤 Sex: ${card.sex || 'N/A'} | Age: ${card.age || student.age}\n\n`;

      // Subjects
      const subjects = card.subjects as any;
      if (subjects && typeof subjects === 'object') {
        msg += `📚 <b>Subjects:</b>\n`;
        for (const [subj, marks] of Object.entries(subjects)) {
          const m = marks as any;
          const avg = m.average || m.avg || 'N/A';
          const status = typeof avg === 'number' && avg < 60 ? '🔴' : '🟢';
          msg += `${status} ${subj}: ${avg}\n`;
        }
      }

      msg += `\n📊 Rank: ${JSON.stringify(card.rank) || 'N/A'}`;
      msg += `\n${card.promoted_to ? `✅ Promoted to: ${card.promoted_to}` : ''}`;
      msg += `${card.detained_in_grade ? `\n❌ Detained in: ${card.detained_in_grade}` : ''}`;

      await send(chatId, msg, { reply_markup: { inline_keyboard: [
        [{ text: "🌐 View Full Card Online", url: `${PORTAL_URL}?tab=reportcard` }],
        [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
      ]}});
      return new Response("OK");
    }

    // Handle pure number - student lookup
    const idMatch = text.match(/^(\d{1,2})$/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const { data: student } = await supabase.from("students").select("*").eq("id", id).single();
      if (!student) {
        await send(chatId, `❌ No student found with ID ${id}.`);
        return new Response("OK");
      }

      let info = `👤 <b>${student.name}</b>\n`;
      info += `🔤 ${student.english_name}\n`;
      info += `🆔 ID: ${student.id}\n`;
      info += `📚 Section: ${student.section || 'N/A'}\n`;
      info += `🎂 Age: ${student.age || 'N/A'}\n`;
      info += `⚧ Gender: ${student.gender || 'N/A'}\n`;
      if (student.telegram) info += `📱 Telegram: ${student.telegram}\n`;
      if (student.instagram) info += `📸 Instagram: ${student.instagram}\n`;

      if (student.image_url) {
        await sendPhoto(chatId, student.image_url, info);
      } else {
        await send(chatId, info);
      }

      await send(chatId, `Quick actions for ${student.name}:`, {
        reply_markup: { inline_keyboard: [
          [{ text: "📝 Mid Results", callback_data: `quick_mid_${student.id}` }, { text: "📋 Final Results", callback_data: `quick_final_${student.id}` }],
          [{ text: "🎓 Report Card", callback_data: `quick_card_${student.id}` }],
          [{ text: "◀️ Back to Menu", callback_data: "menu_start" }],
        ]}
      });
      return new Response("OK");
    }

    // Handle quick action callbacks
    const quickMid = callbackData?.match(/^quick_mid_(\d+)$/);
    if (quickMid) {
      const studentId = quickMid[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", studentId);
      
      if (!results || results.length === 0) {
        await send(chatId, `📝 No mid results for ${student?.name || `ID ${studentId}`}.`);
      } else {
        for (const r of results) {
          if (r.result_image_url) await sendPhoto(chatId, r.result_image_url, `📝 Mid - ${student?.name}`);
        }
      }
      return new Response("OK");
    }

    const quickFinal = callbackData?.match(/^quick_final_(\d+)$/);
    if (quickFinal) {
      const studentId = quickFinal[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", studentId);
      
      if (!results || results.length === 0) {
        await send(chatId, `📋 No final results for ${student?.name || `ID ${studentId}`}.`);
      } else {
        for (const r of results) {
          if (r.result_image_url) await sendPhoto(chatId, r.result_image_url, `📋 Final - ${student?.name}`);
        }
      }
      return new Response("OK");
    }

    const quickCard = callbackData?.match(/^quick_card_(\d+)$/);
    if (quickCard) {
      const studentId = quickCard[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();
      
      if (!card) {
        await send(chatId, `🎓 No report card for ${student?.name || `ID ${studentId}`}.`);
      } else {
        let msg = `🎓 <b>${card.student_name || student?.name}</b> - Report Card\n`;
        const subjects = card.subjects as any;
        if (subjects && typeof subjects === 'object') {
          for (const [subj, marks] of Object.entries(subjects)) {
            const m = marks as any;
            const avg = m.average || m.avg || 'N/A';
            msg += `${typeof avg === 'number' && avg < 60 ? '🔴' : '🟢'} ${subj}: ${avg}\n`;
          }
        }
        msg += `\nRank: ${JSON.stringify(card.rank) || 'N/A'}`;
        await send(chatId, msg);
      }
      return new Response("OK");
    }

    // Handle name search
    if (text.length >= 2 && !text.startsWith("/")) {
      const { data: students } = await supabase
        .from("students")
        .select("*")
        .or(`name.ilike.%${text}%,english_name.ilike.%${text}%`);

      if (students && students.length > 0) {
        const limited = students.slice(0, 5);
        let msg = `🔍 Found ${students.length} student(s):\n\n`;
        for (const s of limited) {
          msg += `🆔 <b>${s.id}</b> - ${s.name} (${s.english_name})\n`;
        }
        if (students.length > 5) msg += `\n... and ${students.length - 5} more`;
        msg += `\n\nSend the ID number to see full details.`;
        await send(chatId, msg);
      } else {
        await send(chatId, `❌ No students found matching "<b>${text}</b>".\n\nTry /students for help.`);
      }
      return new Response("OK");
    }

    // Default response
    await send(chatId, `I didn't understand that. Try /start to see available commands.`);
    return new Response("OK");

  } catch (e) {
    console.error("Telegram bot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
