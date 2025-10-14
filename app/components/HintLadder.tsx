"use client";

import { useState } from "react";
import posthog from "posthog-js";

type Hint = { id: string; text: string };

export function HintLadder({
  sessionId,
  initialShown,
  hints,
  onChange,
}: {
  sessionId: string;
  initialShown: number;
  hints: Hint[];
  /** Called with the new shown count after a successful reveal */
  onChange?: (shown: number) => void;
}) {
  const total = Array.isArray(hints) ? hints.length : 0;
  const [shown, setShown] = useState<number>(
    Number.isFinite(initialShown) ? initialShown : 0
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canReveal = shown < total && !busy;

  async function revealNext() {
    if (!canReveal) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ensure auth cookies are sent
        body: JSON.stringify({ hintIncrement: 1 }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e?.error || "Failed to reveal hint");
      }
      const next = Math.min(shown + 1, total);
      setShown(next);
      onChange?.(next);
      try {
        posthog?.capture?.("hint_revealed", { sessionId, count: next });
      } catch {}
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Hints</h2>
        <button
          onClick={revealNext}
          disabled={!canReveal}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {shown >= total
            ? "All revealed"
            : busy
            ? "Revealing…"
            : "Reveal next"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <ol className="mt-2 list-decimal pl-5 text-sm space-y-1">
        {Array.from({ length: shown }).map((_, i) => (
          <li key={hints[i]?.id ?? i}>{hints[i]?.text ?? ""}</li>
        ))}
      </ol>

      <div className="mt-2 text-xs text-gray-600">
        {shown}/{total} revealed
      </div>
    </div>
  );
}
