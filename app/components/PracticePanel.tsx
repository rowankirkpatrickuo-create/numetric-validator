"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Problem = {
  id: string;
  title: string;
  statementMd?: string;
  finalLatex?: string | null;
  hints?: { id: string; text: string }[];
  tags: string[];
  difficulty: number;
};

export function PracticePanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPractice() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1) Get a random problem
      const r1 = await fetch("/api/problems/random", { cache: "no-store" });
      const ct1 = r1.headers.get("content-type") || "";
      if (!r1.ok || !ct1.includes("application/json")) {
        const txt = !ct1.includes("application/json") ? await r1.text() : "";
        throw new Error(
          !r1.ok
            ? `random_failed_${r1.status}`
            : `random_non_json:${txt.slice(0, 80)}`
        );
      }
      const payload = (await r1.json()) as Problem | { problem?: Problem };
      const problem: Problem = (payload as any).problem ?? (payload as Problem);
      if (!problem?.id) throw new Error("no_problem");

      // 2) Create a session
      const r2 = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "practice", problemId: problem.id }),
      });
      const ct2 = r2.headers.get("content-type") || "";
      if (!r2.ok || !ct2.includes("application/json")) {
        const txt = !ct2.includes("application/json") ? await r2.text() : "";
        throw new Error(
          !r2.ok
            ? `session_failed_${r2.status}`
            : `session_non_json:${txt.slice(0, 80)}`
        );
      }
      const s = await r2.json();
      if (!s?.id) throw new Error("session_create_failed");

      // 3) Navigate immediately — no preview
      router.push(`/sessions/${s.id}`);
    } catch (e: any) {
      setError(e?.message ?? "unknown_error");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Practice</h2>
        <button
          onClick={startPractice}
          disabled={loading}
          aria-busy={loading}
          className="text-xs underline disabled:opacity-60"
        >
          {loading ? "Starting…" : "New problem"}
        </button>
      </div>

      {/* Keep this minimal—only show an error if something actually fails */}
      {error && <div className="text-xs text-red-700">Error: {error}</div>}
    </div>
  );
}
