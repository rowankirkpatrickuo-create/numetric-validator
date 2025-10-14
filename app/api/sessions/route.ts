// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Body = {
  problemId?: string;
  // `mode` is accepted in the request but NOT written to DB (schema may not have it)
  mode?: string;
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauth" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const problemId = body?.problemId;
    if (!problemId) {
      return NextResponse.json({ error: "missing_problemId" }, { status: 400 });
    }

    // Ensure the problem exists (helps avoid foreign key / logic errors)
    const problem = await db.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "problem_not_found" }, { status: 404 });
    }

    // Create the session — only use fields we know exist in your schema:
    // id, userId, problemId, status, hintsShown, steps, createdAt, updatedAt
    const session = await db.session.create({
      data: {
        userId,
        problemId,
        status: "active",
        hintsShown: 0,
        steps: [], // array of Step JSON
      },
    });

    // Return a small, stable payload the client expects
    return NextResponse.json({ id: session.id, ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("Session create failed:", err);
    return NextResponse.json(
      { error: "session_failed", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
