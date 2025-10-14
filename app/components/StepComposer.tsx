"use client";
import { useState, useRef, useEffect } from "react";
import type { Step } from "@/components/SessionWorkspace";

export default function StepComposer({
  sessionId,
  problemId,
  onSubmit,
}: {
  sessionId: string;
  problemId: string;
  onSubmit: (s: Step) => Promise<void> | void;
}) {
  const [mode, setMode] = useState<"text" | "math">("text");
  const [text, setText] = useState("");
  const [latex, setLatex] = useState("");
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        btnRef.current?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit() {
    const ts = Date.now();
    if (mode === "text") {
      const clean = text.trim();
      if (clean.length < 1) return;
      await onSubmit({ kind: "text", mode, ts, text: clean });
      setText("");
    } else {
      const clean = latex.trim();
      if (clean.length < 1) return;
      await onSubmit({ kind: "math", mode, ts, latex: clean });
      setLatex("");
    }
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">Compose step</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setMode("text")}
            className={`rounded-md border px-2 py-1 ${
              mode === "text" ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setMode("math")}
            className={`rounded-md border px-2 py-1 ${
              mode === "math" ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            LaTeX
          </button>
        </div>
      </div>

      {mode === "text" ? (
        <textarea
          className="w-full rounded-md border p-2 text-sm"
          rows={4}
          placeholder="Explain your next move…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <textarea
          className="w-full rounded-md border p-2 font-mono text-sm"
          rows={3}
          placeholder="Type LaTeX here, e.g. x^2 + 2x + 1"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
        />
      )}

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div>Tip: ⌘/Ctrl + Enter to submit</div>
        <button
          ref={btnRef}
          onClick={submit}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Submit step
        </button>
      </div>
    </div>
  );
}
