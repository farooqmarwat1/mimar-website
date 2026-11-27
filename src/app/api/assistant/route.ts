import "server-only";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assistantSystemPrompt } from "@/lib/ai/assistant-prompt";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * The website's AI agent (the chat behind the corner contact button, src/components/contact-fab).
 *
 * Uses Gemini with the same GEMINI_API_KEY / GEMINI_MODEL as the blog tools. Nothing is stored: the
 * browser sends the whole (short) conversation each time and gets one reply back.
 *
 * Abuse protection, in order:
 * 1. Same-origin only: a request must come from a page of this site.
 * 2. Per-IP limits (8 a minute, 40 a day) and a site-wide daily cap, ASSISTANT_DAILY_LIMIT
 *    (default 300), so a flood cannot run up the Gemini bill.
 * 3. Zod caps the conversation: at most 12 turns of 1,000 characters each.
 * 4. The system prompt (src/lib/ai/assistant-prompt.ts) keeps it to the studio's own published facts,
 *    and the reply goes back as plain text (the chat never renders HTML).
 */

const ChatSchema = z.object({
  lang: z.enum(["en", "ar"]).catch("en"),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(12)
    .refine((list) => list[list.length - 1].role === "user", "The last message must be the visitor's."),
});

const IP_MINUTE = { limit: 8, windowSec: 60 };
const IP_DAY = { limit: 40, windowSec: 86_400 };

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[assistant] GEMINI_API_KEY is not set");
    return NextResponse.json({ error: "The assistant is not available." }, { status: 503 });
  }

  const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const dailyCap = Number(process.env.ASSISTANT_DAILY_LIMIT) > 0 ? Number(process.env.ASSISTANT_DAILY_LIMIT) : 300;
  const limit = await checkRateLimit([
    { key: `assistant:ip-minute:${ip}`, ...IP_MINUTE },
    { key: `assistant:ip-day:${ip}`, ...IP_DAY },
    { key: "assistant:site-day", limit: dailyCap, windowSec: 86_400 },
  ]);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many messages." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = ChatSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid conversation." }, { status: 422 });

  const { lang, messages } = parsed.data;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
      contents: messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
      config: { systemInstruction: assistantSystemPrompt(lang), temperature: 0.3, maxOutputTokens: 2048 },
    });
    const reply = (res.text ?? "").trim();
    if (!reply) {
      console.error("[assistant] Empty reply", res.candidates?.[0]?.finishReason ?? res.promptFeedback?.blockReason ?? "");
      return NextResponse.json({ error: "No reply." }, { status: 502 });
    }
    return NextResponse.json({ reply: reply.slice(0, 4000) });
  } catch (err) {
    // The reason only, never the visitor's messages.
    console.error("[assistant] Gemini call failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "The assistant is not available." }, { status: 502 });
  }
}
