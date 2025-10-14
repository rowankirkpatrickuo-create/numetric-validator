// app/api/problems/random/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// ---------- helpers ----------
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

type JsonHint = { id: string; text: string };
type JsonHints = JsonHint[];
type JsonTags = string[];

const toTags = (x: unknown): string[] =>
  Array.isArray(x) ? (x as string[]) : [];
const toHints = (x: unknown): JsonHints =>
  Array.isArray(x) ? (x as JsonHints) : [];
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// ---------- demo fallbacks ----------
const FALLBACKS: Array<{
  title: string;
  statementMd: string;
  finalLatex?: string | null;
  hints?: JsonHints;
  tags?: JsonTags;
  difficulty?: number;
}> = [
  {
    title: "Quadratic roots",
    statementMd: "Solve $x^2 - 5x + 6 = 0$.",
    tags: ["algebra"],
    difficulty: 1,
    hints: [{ id: "h1", text: "Try factoring into $(x-2)(x-3)$." }],
  },
  {
    title: "Power rule",
    statementMd: "Find $\\dfrac{d}{dx} x^3$.",
    tags: ["calculus"],
    difficulty: 1,
    hints: [{ id: "h1", text: "Use $\\tfrac{d}{dx}x^n = n x^{n-1}$." }],
  },
  {
    title: "Unit interval integral",
    statementMd: "Compute $\\int_0^1 x^2\\,dx$.",
    tags: ["calculus"],
    difficulty: 1,
    hints: [{ id: "h1", text: "Antiderivative of $x^2$ is $x^3/3$." }],
  },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag") ?? undefined;
    const diffParam = url.searchParams.get("difficulty");
    const difficulty = diffParam ? Number(diffParam) : undefined;

    // 1) DB read
    const rows = await db.problem.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        statementMd: true,
        finalLatex: true,
        hints: true,
        tags: true,
        difficulty: true,
      },
    });

    // 2) Optional filters
    const filtered = rows.filter((p) => {
      const tags = toTags(p.tags);
      const tagOk = tag ? tags.includes(tag) : true;
      const diffOk = Number.isFinite(difficulty)
        ? Number(p.difficulty) === Number(difficulty)
        : true;
      return tagOk && diffOk;
    });

    // 3) Prefer existing DB problems
    if (filtered.length) {
      const one = pick(filtered);
      return NextResponse.json({
        id: one.id,
        slug: one.slug,
        title: one.title,
        statementMd: one.statementMd,
        finalLatex: one.finalLatex ?? null,
        hints: toHints(one.hints),
        tags: toTags(one.tags),
        difficulty: Number(one.difficulty) || 1,
      });
    }

    // 4) Idempotent fallback: upsert by *slug* (unique)
    const demo = pick(FALLBACKS);
    const demoSlug = slugify(demo.title);

    const saved = await db.problem.upsert({
      where: { slug: demoSlug },
      update: {
        title: demo.title,
        statementMd: demo.statementMd,
        finalLatex: demo.finalLatex ?? null,
        tags: demo.tags ?? [],
        hints: demo.hints ?? [],
        difficulty: demo.difficulty ?? 1,
      },
      create: {
        slug: demoSlug,
        title: demo.title,
        statementMd: demo.statementMd,
        finalLatex: demo.finalLatex ?? null,
        tags: demo.tags ?? [],
        hints: demo.hints ?? [],
        difficulty: demo.difficulty ?? 1,
      },
    });

    return NextResponse.json({
      id: saved.id,
      slug: saved.slug,
      title: saved.title,
      statementMd: saved.statementMd,
      finalLatex: saved.finalLatex ?? null,
      hints: toHints(saved.hints),
      tags: toTags(saved.tags),
      difficulty: Number(saved.difficulty) || 1,
    });
  } catch (e: any) {
    console.error("random_failed:", e);
    return NextResponse.json(
      { error: "random_failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
