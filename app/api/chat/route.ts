import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  prompt: z.string().min(1).max(8000),
  tutorMode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, tutorMode } = BodySchema.parse(body);

    const system =
      tutorMode === "socratic_algebra_calc1"
        ? "You are a precise, Socratic math tutor for Algebra & Calculus I. Teach step-by-step understanding. Use LaTeX ($...$, $$...$$). Avoid answer dumps."
        : "You are a helpful math tutor.";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not set on the server." },
        { status: 500 }
      );
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Mixed input (text + LaTeX):\n\n$$${prompt}$$`,
          },
        ],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Upstream API error" },
        { status: 500 }
      );
    }

    const content =
      data?.choices?.[0]?.message?.content ?? "I couldn’t produce an answer.";
    return NextResponse.json({ content }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
