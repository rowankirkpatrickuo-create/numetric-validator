// app/api/problems/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const rows = await db.problem.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      tags: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ problems: rows });
}
