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

// Simple in-memory state for conversational flow per chat
const chatStates = new Map<number, { mode: string; studentId?: string }>();

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

    if (!chatId) return new Response("OK");

    if (callbackQuery) {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQuery.id }),
      });
    }

    const send = async (cid: number, txt: string, opts: any = {}) => {
      const res = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: cid, text: txt, parse_mode: "HTML", ...opts }),
      });
      return await res.json();
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

    // === MAIN MENU ===
    if (text === "/start" || callbackData === "menu_start") {
      chatStates.delete(chatId);
      const msg = `🏫 <b>ቅዱስ ቴሬዛ ት/ቤት - Student Portal Bot</b>\n\nWelcome! Choose an option:`;
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: mainMenuKeyboard });
      } else {
        await send(chatId, msg, { reply_markup: mainMenuKeyboard });
      }
      return new Response("OK");
    }

    // === TEXTBOOKS MENU ===
    if (callbackData === "menu_textbooks") {
      chatStates.delete(chatId);
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

    // Textbook selected - show content categories
    const tbMatch = callbackData?.match(/^tb_(\w+)$/);
    if (tbMatch) {
      const tbKey = tbMatch[1];
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

    // Textbook content category selected - show items list
    const tbcMatch = callbackData?.match(/^tbc_(\w+)_(activities|exercises|review)$/);
    if (tbcMatch) {
      const tbKey = tbcMatch[1];
      const category = tbcMatch[2];
      // Set state to await number input
      chatStates.set(chatId, { mode: `tb_browse_${tbKey}_${category}` });
      
      const catLabel = category === 'activities' ? 'Activities' : category === 'exercises' ? 'Exercises' : 'Review Exercises';
      const msg = `📚 <b>${tbKey.charAt(0).toUpperCase() + tbKey.slice(1)} - ${catLabel}</b>\n\nType the number to view content.\nExample: <code>4.1</code>`;
      
      const kb = {
        inline_keyboard: [[{ text: "◀️ Back", callback_data: `tb_${tbKey}` }]],
      };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // === STUDENTS MENU ===
    if (callbackData === "menu_students") {
      chatStates.set(chatId, { mode: "students_search" });
      const msg = `👥 <b>Student Directory</b>\n\nType a student ID (1-98) or name to search:`;
      const kb = {
        inline_keyboard: [
          [{ text: "🌐 View All Online", url: `${PORTAL_URL}?tab=students` }],
          [{ text: "◀️ Back", callback_data: "menu_start" }],
        ],
      };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // === MID EXAM - conversational ===
    if (callbackData === "menu_mid") {
      chatStates.set(chatId, { mode: "mid_await_id" });
      const msg = `📝 <b>Mid Exam Results</b>\n\nType your student ID number:`;
      const kb = { inline_keyboard: [[{ text: "◀️ Back", callback_data: "menu_start" }]] };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // === FINAL EXAM - conversational ===
    if (callbackData === "menu_final") {
      chatStates.set(chatId, { mode: "final_await_id" });
      const msg = `📋 <b>Final Exam Results</b>\n\nType your student ID number:`;
      const kb = { inline_keyboard: [[{ text: "◀️ Back", callback_data: "menu_start" }]] };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // === REPORT CARD - conversational ===
    if (callbackData === "menu_reportcard") {
      chatStates.set(chatId, { mode: "card_await_id" });
      const msg = `🎓 <b>Report Card</b>\n\nType your student ID number:`;
      const kb = { inline_keyboard: [[{ text: "◀️ Back", callback_data: "menu_start" }]] };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // === MINISTRY RESULTS ===
    if (callbackData === "menu_results") {
      chatStates.set(chatId, { mode: "results_await_id" });
      const msg = `📊 <b>Ministry Exam Results</b>\n\nType your ministry ID number:`;
      const kb = { inline_keyboard: [[{ text: "◀️ Back", callback_data: "menu_start" }]] };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // === STUDENT DETAIL CALLBACKS ===
    const quickMid = callbackData?.match(/^quick_mid_(\d+)$/);
    if (quickMid) {
      const studentId = quickMid[1];
      await handleMidResults(chatId, studentId);
      return new Response("OK");
    }

    const quickFinal = callbackData?.match(/^quick_final_(\d+)$/);
    if (quickFinal) {
      const studentId = quickFinal[1];
      await handleFinalResults(chatId, studentId);
      return new Response("OK");
    }

    const quickCard = callbackData?.match(/^quick_card_(\d+)$/);
    if (quickCard) {
      const studentId = quickCard[1];
      await handleReportCard(chatId, studentId);
      return new Response("OK");
    }

    const studentCallback = callbackData?.match(/^student_(\d+)$/);
    if (studentCallback) {
      const studentId = parseInt(studentCallback[1]);
      const { data: student } = await supabase.from("students").select("*").eq("id", studentId).single();
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

    // === CONVERSATIONAL TEXT HANDLERS ===
    const state = chatStates.get(chatId);

    if (state && text) {
      // Textbook content browsing
      const tbBrowse = state.mode.match(/^tb_browse_(\w+)_(activities|exercises|review)$/);
      if (tbBrowse) {
        const tbKey = tbBrowse[1];
        const category = tbBrowse[2];
        const searchNum = text.trim();
        
        // Fetch content from the edge function or use inline data
        const catKey = category === 'review' ? 'Review Exercise' : category === 'activities' ? 'Activity' : 'Exercise';
        const searchId = `${catKey} ${searchNum}`;
        
        // We need to search the textbook content - let's fetch from the portal data
        const portalUrl = `${PORTAL_URL}`;
        
        // Send a message saying we found it or not
        await send(chatId, `🔍 Looking for <b>${searchId}</b> in ${tbKey}...\n\n📱 For full content, open the textbook on the portal and use the Content Finder button.`, {
          reply_markup: { inline_keyboard: [
            [{ text: "🌐 Open in Portal", url: `${PORTAL_URL}?tab=textbooks` }],
            [{ text: "◀️ Back", callback_data: `tb_${tbKey}` }],
          ]},
        });
        return new Response("OK");
      }

      // Mid - awaiting ID
      if (state.mode === "mid_await_id") {
        const idNum = text.match(/^(\d+)$/);
        if (idNum) {
          const studentId = idNum[1];
          const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
          if (!student) {
            await send(chatId, `❌ Student with ID ${studentId} not found. Try again:`);
            return new Response("OK");
          }
          await handleMidResults(chatId, studentId);
          chatStates.delete(chatId);
          return new Response("OK");
        }
        await send(chatId, `⚠️ Please type only the ID number (e.g. <code>5</code>):`);
        return new Response("OK");
      }

      // Mid - awaiting password
      if (state.mode === "mid_await_password" && state.studentId) {
        const password = text;
        const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(state.studentId)).single();
        const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", state.studentId);
        
        if (results) {
          const locked = results.filter((r: any) => r.student_password);
          const matched = locked.filter((r: any) => r.student_password === password);
          if (matched.length > 0) {
            for (const r of matched) {
              if (r.result_image_url) {
                const kb: any = { inline_keyboard: [] };
                if (r.answer_image_url) {
                  kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id}` }]);
                }
                await sendPhoto(chatId, r.result_image_url, `🔓 Mid Result - ${student?.name}`, { reply_markup: kb });
              }
            }
            chatStates.delete(chatId);
          } else {
            await send(chatId, `❌ Incorrect password. Try again:`);
          }
        }
        return new Response("OK");
      }

      // Final - awaiting ID
      if (state.mode === "final_await_id") {
        const idNum = text.match(/^(\d+)$/);
        if (idNum) {
          const studentId = idNum[1];
          const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
          if (!student) {
            await send(chatId, `❌ Student with ID ${studentId} not found. Try again:`);
            return new Response("OK");
          }
          await handleFinalResults(chatId, studentId);
          chatStates.delete(chatId);
          return new Response("OK");
        }
        await send(chatId, `⚠️ Please type only the ID number (e.g. <code>5</code>):`);
        return new Response("OK");
      }

      // Final - awaiting password
      if (state.mode === "final_await_password" && state.studentId) {
        const password = text;
        const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(state.studentId)).single();
        const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", state.studentId);
        
        if (results) {
          const locked = results.filter((r: any) => r.student_password);
          const matched = locked.filter((r: any) => r.student_password === password);
          if (matched.length > 0) {
            for (const r of matched) {
              if (r.result_image_url) {
                const kb: any = { inline_keyboard: [] };
                if (r.answer_image_url) {
                  kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id}` }]);
                }
                await sendPhoto(chatId, r.result_image_url, `🔓 Final Result - ${student?.name}`, { reply_markup: kb });
              }
            }
            chatStates.delete(chatId);
          } else {
            await send(chatId, `❌ Incorrect password. Try again:`);
          }
        }
        return new Response("OK");
      }

      // Report Card - awaiting ID
      if (state.mode === "card_await_id") {
        const idNum = text.match(/^(\d+)$/);
        if (idNum) {
          const studentId = idNum[1];
          const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
          if (!student) {
            await send(chatId, `❌ Student with ID ${studentId} not found. Try again:`);
            return new Response("OK");
          }
          await handleReportCard(chatId, studentId);
          chatStates.delete(chatId);
          return new Response("OK");
        }
        await send(chatId, `⚠️ Please type only the ID number (e.g. <code>5</code>):`);
        return new Response("OK");
      }

      // Report Card - awaiting password
      if (state.mode === "card_await_password" && state.studentId) {
        const password = text;
        const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(state.studentId)).single();
        const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", state.studentId).single();
        
        if (card && card.card_password === password) {
          await sendReportCardDetails(chatId, card, student, state.studentId);
          chatStates.delete(chatId);
        } else {
          await send(chatId, `❌ Incorrect password. Try again:`);
        }
        return new Response("OK");
      }

      // Ministry results - awaiting ID
      if (state.mode === "results_await_id") {
        // Handle ministry result lookup
        await send(chatId, `📊 Looking up ministry results for ID <b>${text}</b>...\n\n📱 View full results on the portal:`, {
          reply_markup: { inline_keyboard: [
            [{ text: "🌐 View Online", url: `${PORTAL_URL}?tab=results` }],
            [{ text: "◀️ Main Menu", callback_data: "menu_start" }],
          ]},
        });
        chatStates.delete(chatId);
        return new Response("OK");
      }

      // Students search mode
      if (state.mode === "students_search") {
        // Check if it's a number
        const idNum = text.match(/^(\d{1,2})$/);
        if (idNum) {
          const id = parseInt(idNum[1]);
          const { data: student } = await supabase.from("students").select("*").eq("id", id).single();
          if (!student) {
            await send(chatId, `❌ No student found with ID ${id}. Try again:`);
            return new Response("OK");
          }
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

        // Name search
        if (text.length >= 2) {
          const { data: students } = await supabase
            .from("students").select("*")
            .or(`name.ilike.%${text}%,english_name.ilike.%${text}%`);
          if (students && students.length > 0) {
            const limited = students.slice(0, 5);
            let msg = `🔍 Found ${students.length} student(s):\n\n`;
            for (const s of limited) {
              msg += `🆔 <b>${s.id}</b> - ${s.name} (${s.english_name})\n`;
            }
            if (students.length > 5) msg += `\n... and ${students.length - 5} more`;
            msg += `\n\nType the ID number to see details.`;
            await send(chatId, msg);
          } else {
            await send(chatId, `❌ No students found matching "<b>${text}</b>". Try again:`);
          }
          return new Response("OK");
        }
      }
    }

    // === FALLBACK FOR CALLBACKS NOT HANDLED ===
    // Answer callback for mid/final answer images
    const answerMid = callbackData?.match(/^answer_mid_(.+)$/);
    if (answerMid) {
      const resultId = answerMid[1];
      const { data: result } = await extSupabase.from("mid_results").select("*").eq("id", resultId).single();
      if (result?.answer_image_url) {
        await sendPhoto(chatId, result.answer_image_url, `📝 Answer Key`);
      } else {
        await send(chatId, `❌ No answer key available.`);
      }
      return new Response("OK");
    }

    const answerFinal = callbackData?.match(/^answer_final_(.+)$/);
    if (answerFinal) {
      const resultId = answerFinal[1];
      const { data: result } = await extSupabase.from("final_results").select("*").eq("id", resultId).single();
      if (result?.answer_image_url) {
        await sendPhoto(chatId, result.answer_image_url, `📝 Answer Key`);
      } else {
        await send(chatId, `❌ No answer key available.`);
      }
      return new Response("OK");
    }

    // Handle pure number without state - show student
    const idMatch = text.match(/^(\d{1,2})$/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const { data: student } = await supabase.from("students").select("*").eq("id", id).single();
      if (!student) {
        await send(chatId, `❌ No student found with ID ${id}.`);
        return new Response("OK");
      }
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
      const { data: students } = await supabase
        .from("students").select("*")
        .or(`name.ilike.%${text}%,english_name.ilike.%${text}%`);
      if (students && students.length > 0) {
        const limited = students.slice(0, 5);
        let msg = `🔍 Found ${students.length} student(s):\n\n`;
        for (const s of limited) {
          msg += `🆔 <b>${s.id}</b> - ${s.name} (${s.english_name})\n`;
        }
        if (students.length > 5) msg += `\n... and ${students.length - 5} more`;
        msg += `\n\nType the ID number to see details.`;
        await send(chatId, msg);
      } else {
        await send(chatId, `❌ No students found matching "<b>${text}</b>".\n\nTry /start to see available options.`);
      }
      return new Response("OK");
    }

    // Default
    await send(chatId, `I didn't understand that. Try /start to see available options.`);
    return new Response("OK");

    // === HELPER FUNCTIONS ===
    async function handleMidResults(cid: number, studentId: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", studentId);

      if (!results || results.length === 0) {
        await send(cid, `📝 No mid exam results found for <b>${student?.name || `ID ${studentId}`}</b>.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }

      const hasLocked = results.some((r: any) => r.student_password);
      const unlocked = results.filter((r: any) => !r.student_password);

      for (const r of unlocked) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) {
            kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id}` }]);
          }
          await sendPhoto(cid, r.result_image_url, `📝 Mid Result - ${student?.name}`, { reply_markup: kb });
        }
      }

      if (hasLocked) {
        const lockedCount = results.filter((r: any) => r.student_password).length;
        chatStates.set(cid, { mode: "mid_await_password", studentId });
        await send(cid, `🔒 ${lockedCount} result(s) are password protected.\n\nType the password:`);
      } else {
        await send(cid, `✅ ${results.length} mid result(s) for ${student?.name}`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
      }
    }

    async function handleFinalResults(cid: number, studentId: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", studentId);

      if (!results || results.length === 0) {
        await send(cid, `📋 No final exam results found for <b>${student?.name || `ID ${studentId}`}</b>.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }

      const hasLocked = results.some((r: any) => r.student_password);
      const unlocked = results.filter((r: any) => !r.student_password);

      for (const r of unlocked) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) {
            kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id}` }]);
          }
          await sendPhoto(cid, r.result_image_url, `📋 Final Result - ${student?.name}`, { reply_markup: kb });
        }
      }

      if (hasLocked) {
        const lockedCount = results.filter((r: any) => r.student_password).length;
        chatStates.set(cid, { mode: "final_await_password", studentId });
        await send(cid, `🔒 ${lockedCount} result(s) are password protected.\n\nType the password:`);
      } else {
        await send(cid, `✅ ${results.length} final result(s) for ${student?.name}`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
      }
    }

    async function handleReportCard(cid: number, studentId: string) {
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();

      if (!card) {
        await send(cid, `🎓 No report card found for <b>${student?.name || `ID ${studentId}`}</b>.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Main Menu", callback_data: "menu_start" }]] },
        });
        return;
      }

      if (card.card_password) {
        chatStates.set(cid, { mode: "card_await_password", studentId });
        await send(cid, `🔒 Report card for <b>${student?.name}</b> is password protected.\n\nType the password:`);
        return;
      }

      await sendReportCardDetails(cid, card, student, studentId);
    }

    async function sendReportCardDetails(cid: number, card: any, student: any, studentId: string) {
      const subjects = card.subjects as any;
      let msg = `🎓 <b>Report Card - ${card.student_name || student?.name}</b>\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `📋 Grade: ${card.grade || 'N/A'} | Section: ${student?.section || 'N/A'}\n`;
      msg += `📅 School Year: ${card.school_year || 'N/A'}\n`;
      msg += `👤 Sex: ${card.sex || 'N/A'} | Age: ${card.age || student?.age || 'N/A'}\n\n`;

      if (subjects && typeof subjects === 'object') {
        msg += `📚 <b>Subjects:</b>\n`;
        let totalAvg = 0;
        let subCount = 0;
        let failCount = 0;

        for (const subj of SUBJECTS) {
          const marks = subjects[subj];
          if (!marks) continue;
          const vals = ['1st', '2nd', '3rd', '4th'].map((q: string) => marks[q]).filter((v: any) => v != null) as number[];
          if (vals.length === 0) continue;
          const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
          totalAvg += avg;
          subCount++;
          if (avg < 60) failCount++;
          const status = avg < 60 ? '🔴' : '🟢';
          msg += `${status} ${subj}: ${avg.toFixed(1)}\n`;
        }

        if (subCount > 0) {
          const overallAvg = totalAvg / subCount;
          msg += `\n📊 <b>Total Average:</b> ${overallAvg.toFixed(1)}`;
          msg += `\n📈 <b>Rank:</b> ${card.rank ? Object.values(card.rank).filter((v: any) => v != null)[0] || 'N/A' : 'N/A'}`;
          if (card.total_students) msg += ` / ${card.total_students}`;

          const promoted = failCount < 2;
          const gradeNum = card.grade ? parseInt(card.grade.replace(/\D/g, '')) : 9;
          msg += `\n\n${promoted ? `✅ <b>Promoted to Grade ${gradeNum + 1}</b>` : `❌ <b>Detained in Grade ${gradeNum}</b>`}`;
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
