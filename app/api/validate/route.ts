import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userInput, target } = await req.json();
  const ok = typeof userInput === "string" && userInput.trim().length > 0;
  const verdict =
    ok &&
    target &&
    userInput.replace(/\s+/g, "") === String(target).replace(/\s+/g, "")
      ? "correct"
      : ok
      ? "needs_work"
      : "error";
  return NextResponse.json({
    verdict,
    message:
      verdict === "correct"
        ? "Nice!"
        : verdict === "needs_work"
        ? "Keep going."
        : "Empty input.",
  });
}
