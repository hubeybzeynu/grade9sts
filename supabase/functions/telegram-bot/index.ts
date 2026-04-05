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

    // Answer callback query
    if (callbackQuery) {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQuery.id }),
      });
    }

    // Helper: send new message
    const send = async (chatId: number, text: string, opts: any = {}) => {
      const res = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...opts }),
      });
      return await res.json();
    };

    // Helper: edit existing message
    const editMessage = async (chatId: number, messageId: number, text: string, opts: any = {}) => {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", ...opts }),
      });
    };

    // Helper: send photo
    const sendPhoto = async (chatId: number, photo: string, caption?: string, opts: any = {}) => {
      await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo, caption, parse_mode: "HTML", ...opts }),
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

    // SUBJECTS for report card
    const SUBJECTS = ['Amharic', 'English', 'Mathematics', 'General Science', 'Social Studies',
      'Citizenship Education', 'Performing & Visual Arts', 'Information Technology',
      'Health & Physical Education', 'Career & Technical Education'];

    // === CALLBACK HANDLERS (edit messages instead of sending new) ===

    // Main menu (from /start or back)
    if (text === "/start" || callbackData === "menu_start") {
      const msg = `🏫 <b>ቅዱስ ቴሬዛ ት/ቤት - Student Portal Bot</b>\n\nWelcome! Choose an option:`;
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: mainMenuKeyboard });
      } else {
        await send(chatId, msg, { reply_markup: mainMenuKeyboard });
      }
      return new Response("OK");
    }

    // Textbooks
    if (text === "/textbooks" || callbackData === "menu_textbooks") {
      const textbooks = [
        { name: "📐 Mathematics", file: "G9-Mathematics" },
        { name: "🧪 Chemistry", file: "G9-Chemistry" },
        { name: "🧬 Biology", file: "G9-Biology" },
        { name: "💰 Economics", file: "G9-Economics" },
        { name: "🏃 HPE", file: "G9-HPE" },
        { name: "📖 Amharic", file: "Amharic-G9" },
      ];
      const msg = `📚 <b>Grade 9 Textbooks</b>\n\nSelect a textbook to view on the portal:`;
      const kb = {
        inline_keyboard: textbooks.map(t => [{ text: t.name, url: `${PORTAL_URL}?tab=textbooks` }])
          .concat([[{ text: "◀️ Back", callback_data: "menu_start" }]]),
      };
      if (callbackMessageId) {
        await editMessage(chatId, callbackMessageId, msg, { reply_markup: kb });
      } else {
        await send(chatId, msg, { reply_markup: kb });
      }
      return new Response("OK");
    }

    // Students menu
    if (text === "/students" || callbackData === "menu_students") {
      const msg = `👥 <b>Student Directory</b>\n\nSend a student's ID number (1-98) to see their info.\nOr send their name in Amharic or English to search.\n\nExample: <code>5</code> or <code>Hubeyb</code>`;
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

    // Mid menu
    if (text === "/mid" || callbackData === "menu_mid") {
      const msg = `📝 <b>Mid Exam Results</b>\n\nSend your student ID to check mid exam results.\nFormat: <code>mid 5</code>`;
      const kb = {
        inline_keyboard: [
          [{ text: "🌐 View Online", url: `${PORTAL_URL}?tab=mid` }],
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

    // Final menu
    if (text === "/final" || callbackData === "menu_final") {
      const msg = `📋 <b>Final Exam Results</b>\n\nSend your student ID to check final exam results.\nFormat: <code>final 5</code>`;
      const kb = {
        inline_keyboard: [
          [{ text: "🌐 View Online", url: `${PORTAL_URL}?tab=final` }],
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

    // Report card menu
    if (text === "/reportcard" || callbackData === "menu_reportcard") {
      const msg = `🎓 <b>Report Card</b>\n\nSend your student ID to check your report card.\nFormat: <code>card 5</code>`;
      const kb = {
        inline_keyboard: [
          [{ text: "🌐 View Online", url: `${PORTAL_URL}?tab=reportcard` }],
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

    // Ministry results menu
    if (text === "/results" || callbackData === "menu_results") {
      const msg = `📊 <b>Ministry Exam Results</b>\n\nSend your ministry ID to check results.\nFormat: <code>result 219335</code>`;
      const kb = {
        inline_keyboard: [
          [{ text: "🌐 View Online", url: `${PORTAL_URL}?tab=results` }],
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

    // Portal
    if (text === "/portal") {
      await send(chatId, `🌐 <b>Open the Student Portal:</b>\n${PORTAL_URL}`);
      return new Response("OK");
    }

    // === STUDENT DETAIL CALLBACKS ===

    // Quick Mid results for student
    const quickMid = callbackData?.match(/^quick_mid_(\d+)$/);
    if (quickMid) {
      const studentId = quickMid[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", studentId);

      if (!results || results.length === 0) {
        await editMessage(chatId, callbackMessageId!, `📝 No mid results found for ${student?.name || `ID ${studentId}`}.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
        });
      } else {
        // Check for password-protected results
        const hasLocked = results.some((r: any) => r.student_password);
        if (hasLocked) {
          // Show locked message first
          const lockedResults = results.filter((r: any) => r.student_password);
          const unlockedResults = results.filter((r: any) => !r.student_password);

          // Send unlocked results
          for (const r of unlockedResults) {
            if (r.result_image_url) {
              const kb: any = { inline_keyboard: [] };
              if (r.answer_image_url) {
                kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id || studentId}` }]);
              }
              await sendPhoto(chatId, r.result_image_url, `📝 Mid Result - ${student?.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
            }
          }

          if (lockedResults.length > 0) {
            await send(chatId, `🔒 ${lockedResults.length} result(s) are password protected.\nSend: <code>unlock mid ${studentId} [password]</code>`, {
              reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
            });
          }
        } else {
          // All unlocked - send photos
          for (const r of results) {
            if (r.result_image_url) {
              const kb: any = { inline_keyboard: [] };
              if (r.answer_image_url) {
                kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id || studentId}` }]);
              }
              await sendPhoto(chatId, r.result_image_url, `📝 Mid Result - ${student?.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
            }
          }
          await send(chatId, `✅ ${results.length} mid result(s) for ${student?.name}`, {
            reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
          });
        }
      }
      return new Response("OK");
    }

    // Quick Final results for student
    const quickFinal = callbackData?.match(/^quick_final_(\d+)$/);
    if (quickFinal) {
      const studentId = quickFinal[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", studentId);

      if (!results || results.length === 0) {
        await editMessage(chatId, callbackMessageId!, `📋 No final results found for ${student?.name || `ID ${studentId}`}.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
        });
      } else {
        const hasLocked = results.some((r: any) => r.student_password);
        if (hasLocked) {
          const unlockedResults = results.filter((r: any) => !r.student_password);
          const lockedResults = results.filter((r: any) => r.student_password);

          for (const r of unlockedResults) {
            if (r.result_image_url) {
              const kb: any = { inline_keyboard: [] };
              if (r.answer_image_url) {
                kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id || studentId}` }]);
              }
              await sendPhoto(chatId, r.result_image_url, `📋 Final Result - ${student?.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
            }
          }

          if (lockedResults.length > 0) {
            await send(chatId, `🔒 ${lockedResults.length} result(s) are password protected.\nSend: <code>unlock final ${studentId} [password]</code>`, {
              reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
            });
          }
        } else {
          for (const r of results) {
            if (r.result_image_url) {
              const kb: any = { inline_keyboard: [] };
              if (r.answer_image_url) {
                kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id || studentId}` }]);
              }
              await sendPhoto(chatId, r.result_image_url, `📋 Final Result - ${student?.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
            }
          }
          await send(chatId, `✅ ${results.length} final result(s) for ${student?.name}`, {
            reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
          });
        }
      }
      return new Response("OK");
    }

    // Quick Report Card for student
    const quickCard = callbackData?.match(/^quick_card_(\d+)$/);
    if (quickCard) {
      const studentId = quickCard[1];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();

      if (!card) {
        await editMessage(chatId, callbackMessageId!, `🎓 No report card found for ${student?.name || `ID ${studentId}`}.`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
        });
      } else if (card.card_password) {
        await editMessage(chatId, callbackMessageId!, `🔒 <b>Report Card Protected</b>\n\nThis report card is password protected.\nSend: <code>unlock card ${studentId} [password]</code>`, {
          reply_markup: { inline_keyboard: [[{ text: "◀️ Back", callback_data: `student_${studentId}` }]] },
        });
      } else {
        await sendReportCardDetails(chatId, card, student, studentId);
      }
      return new Response("OK");
    }

    // Student detail callback (back to student info)
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

    // === TEXT COMMAND HANDLERS ===

    // Unlock mid results: "unlock mid [id] [password]"
    const unlockMid = text.match(/^unlock\s+mid\s+(\d+)\s+(.+)$/i);
    if (unlockMid) {
      const studentId = unlockMid[1];
      const password = unlockMid[2];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("mid_results").select("*").eq("student_id", studentId);

      if (!results || results.length === 0) {
        await send(chatId, `📝 No mid results found for ID ${studentId}.`);
        return new Response("OK");
      }

      const locked = results.filter((r: any) => r.student_password);
      const matched = locked.filter((r: any) => r.student_password === password);

      if (matched.length === 0) {
        await send(chatId, `❌ Incorrect password for mid results.`);
        return new Response("OK");
      }

      for (const r of matched) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) {
            kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id || studentId}` }]);
          }
          await sendPhoto(chatId, r.result_image_url, `🔓 Mid Result - ${student?.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
        }
      }
      return new Response("OK");
    }

    // Unlock final results: "unlock final [id] [password]"
    const unlockFinal = text.match(/^unlock\s+final\s+(\d+)\s+(.+)$/i);
    if (unlockFinal) {
      const studentId = unlockFinal[1];
      const password = unlockFinal[2];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: results } = await extSupabase.from("final_results").select("*").eq("student_id", studentId);

      if (!results || results.length === 0) {
        await send(chatId, `📋 No final results found for ID ${studentId}.`);
        return new Response("OK");
      }

      const locked = results.filter((r: any) => r.student_password);
      const matched = locked.filter((r: any) => r.student_password === password);

      if (matched.length === 0) {
        await send(chatId, `❌ Incorrect password for final results.`);
        return new Response("OK");
      }

      for (const r of matched) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) {
            kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id || studentId}` }]);
          }
          await sendPhoto(chatId, r.result_image_url, `🔓 Final Result - ${student?.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
        }
      }
      return new Response("OK");
    }

    // Unlock report card: "unlock card [id] [password]"
    const unlockCard = text.match(/^unlock\s+card\s+(\d+)\s+(.+)$/i);
    if (unlockCard) {
      const studentId = unlockCard[1];
      const password = unlockCard[2];
      const { data: student } = await supabase.from("students").select("*").eq("id", parseInt(studentId)).single();
      const { data: card } = await supabase.from("report_cards").select("*").eq("student_id", studentId).single();

      if (!card) {
        await send(chatId, `🎓 No report card found for ID ${studentId}.`);
        return new Response("OK");
      }

      if (card.card_password && card.card_password !== password) {
        await send(chatId, `❌ Incorrect password for report card.`);
        return new Response("OK");
      }

      await sendReportCardDetails(chatId, card, student, studentId);
      return new Response("OK");
    }

    // Handle "mid [id]"
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

      const hasLocked = results.some((r: any) => r.student_password);
      const unlocked = results.filter((r: any) => !r.student_password);

      for (const r of unlocked) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) {
            kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_mid_${r.id || studentId}` }]);
          }
          await sendPhoto(chatId, r.result_image_url, `📝 Mid Result - ${student.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
        }
      }

      if (hasLocked) {
        const lockedCount = results.filter((r: any) => r.student_password).length;
        await send(chatId, `🔒 ${lockedCount} result(s) are password protected.\nSend: <code>unlock mid ${studentId} [password]</code>`);
      }
      return new Response("OK");
    }

    // Handle "final [id]"
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

      const hasLocked = results.some((r: any) => r.student_password);
      const unlocked = results.filter((r: any) => !r.student_password);

      for (const r of unlocked) {
        if (r.result_image_url) {
          const kb: any = { inline_keyboard: [] };
          if (r.answer_image_url) {
            kb.inline_keyboard.push([{ text: "📝 Show Answer", callback_data: `answer_final_${r.id || studentId}` }]);
          }
          await sendPhoto(chatId, r.result_image_url, `📋 Final Result - ${student.name}${r.subject ? ` • ${r.subject}` : ''}`, { reply_markup: kb });
        }
      }

      if (hasLocked) {
        const lockedCount = results.filter((r: any) => r.student_password).length;
        await send(chatId, `🔒 ${lockedCount} result(s) are password protected.\nSend: <code>unlock final ${studentId} [password]</code>`);
      }
      return new Response("OK");
    }

    // Handle "card [id]"
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

      if (card.card_password) {
        await send(chatId, `🔒 <b>Report Card Protected</b>\n\nReport card for <b>${student.name}</b> is password protected.\nSend: <code>unlock card ${studentId} [password]</code>`);
        return new Response("OK");
      }

      await sendReportCardDetails(chatId, card, student, studentId);
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

    // Default
    await send(chatId, `I didn't understand that. Try /start to see available commands.`);
    return new Response("OK");

    // Helper function to send report card details
    async function sendReportCardDetails(chatId: number, card: any, student: any, studentId: string) {
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

      await send(chatId, msg, {
        reply_markup: { inline_keyboard: [
          [{ text: "🌐 View Full Card Online", url: `${PORTAL_URL}?tab=reportcard` }],
          [{ text: "◀️ Back", callback_data: `student_${studentId}` }],
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
