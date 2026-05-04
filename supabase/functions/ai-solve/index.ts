// AI tutor: math/physics/chemistry/trig/geometry. Uses Google Gemini directly
// via the user-supplied GEMINI_API_KEY. Returns a structured JSON answer.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SHAPES = [
  'square', 'rectangle', 'circle', 'triangle', 'right-triangle',
  'pentagon', 'hexagon', 'heptagon', 'octagon',
  'parallelogram', 'trapezoid', 'rhombus',
  'square-in-circle', 'circle-in-square', 'triangle-in-circle',
];

const SYSTEM_PROMPT = `You are an EXPERT Grade 9 STEM tutor specializing in math, physics, chemistry, trigonometry, and geometry. You explain like a patient teacher: precise, complete, and step-by-step. Always double-check your arithmetic before answering. If a problem is ambiguous, state your assumption explicitly in step 1. Never invent formulas — use only standard ones. Use SI units. Round only at the final step (keep 4+ significant figures internally).

Respond with a SINGLE JSON object (no markdown, no code fences) of this shape:
{
  "answer": "short plain-text final answer with units",
  "steps": ["step 1", "step 2", "..."],
  "plot": null
        | { "type": "quadratic", "a": number, "b": number, "c": number, "roots": number[] }
        | { "type": "function", "expr": "math.js expression in x", "xmin": number, "xmax": number }
        | { "type": "triangle", "angleA": number, "opposite"?: string, "adjacent"?: string, "hypotenuse"?: string, "caption"?: string }
        | { "type": "shape", "shape": "${SHAPES.join('|')}", "side"?: number, "width"?: number, "height"?: number, "radius"?: number, "caption"?: string, "label"?: string }
        | { "type": "elements", "symbols": ["H","O", ...], "caption"?: string }
}
Rules:
- For quadratic equations or y = ax^2+bx+c, include plot.type = "quadratic" with numeric a,b,c and roots.
- For "graph", "plot", or "draw f(x)=…", include plot.type = "function" using a math.js expression in x.
- For trigonometry questions involving a right-angled triangle (sin/cos/tan, finding a side/angle, SOH-CAH-TOA), ALWAYS:
  * Show the answer with units.
  * In "steps", explicitly write SOH-CAH-TOA, identify opposite/adjacent/hypotenuse, set up the equation, solve.
  * Include plot.type = "triangle" with the relevant angle (degrees) and labelled side strings.
- For geometry/area/perimeter of a shape, use plot.type = "shape" with dimensions and put the area/perimeter in "label".
- For chemistry questions about a chemical / compound / reaction, list the involved element symbols in plot.type = "elements".
- Otherwise plot is null.
- Keep steps concise, one logical step per item, plain unicode (no LaTeX).
- Output JSON only, no prose around it.`;

// Strip ```json fences if Gemini wraps the response.
function extractJson(s: string): string {
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  return s.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, imageBase64 } = await req.json();
    if ((!question || typeof question !== "string") && !imageBase64) {
      return new Response(JSON.stringify({ error: "Missing 'question' or image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Build Gemini parts (text + optional inline image).
    const parts: unknown[] = [
      { text: question || "Solve / explain this problem." },
    ];
    if (imageBase64) {
      // imageBase64 looks like "data:image/jpeg;base64,XXXX" — split safely.
      const m = String(imageBase64).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
      if (m) {
        parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
      }
    }

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini error", resp.status, t);
      return new Response(JSON.stringify({ error: `Gemini error: ${t.slice(0, 300)}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content: string =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "{}";

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      parsed = { answer: content, steps: [], plot: null };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-solve error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
