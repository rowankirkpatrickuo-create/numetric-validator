"use client";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { HintLadder } from "@/components/HintLadder";
import StepsFeed from "@/components/StepsFeed";
import StepComposer from "@/components/StepComposer";
import ProgressPanel from "@/components/ProgressPanel";

// Shared type (mirrors /types/session.ts)
type StepBase = { ts: number; mode: "text" | "math" };
export type TextStep = StepBase & { kind: "text"; text: string };
export type MathStep = StepBase & { kind: "math"; latex: string };
export type Step = TextStep | MathStep;

export default function SessionWorkspace({
  initialSession,
  problem,
}: {
  initialSession: {
    id: string;
    status: "active" | "completed" | "abandoned" | string;
    hintsShown: number;
    steps: Step[];
    problemId: string | null;
  };
  problem:
    | {
        id: string;
        title: string;
        statement?: string;
        statementMd?: string;
        hints?: Array<{ id: string; text: string }>;
      }
    | null
    | undefined;
}) {
  if (!problem) {
    return (
      <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Problem unavailable</h2>
        <p className="mt-1 text-sm text-gray-700">
          We couldn’t load the problem data for this session. Try starting a new
          practice session.
        </p>
      </div>
    );
  }

  const [steps, setSteps] = useState<Step[]>(
    Array.isArray(initialSession.steps) ? initialSession.steps : []
  );
  const [status] = useState(
    (initialSession.status as "active" | "completed" | "abandoned") ?? "active"
  );
  const [hintsShown, setHintsShown] = useState<number>(
    Number.isFinite(initialSession.hintsShown) ? initialSession.hintsShown : 0
  );

  async function appendStep(step: Step) {
    setSteps((s) => [...s, step]); // optimistic
    const r = await fetch(`/api/sessions/${initialSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ensure cookies (Clerk) flow
      body: JSON.stringify({ op: "append_step", step }),
    });
    if (!r.ok) {
      setSteps((s) => s.filter((x) => x !== step)); // rollback
      const err = await r.json().catch(() => ({}));
      alert(err?.error || "Failed to save step");
    }
  }

  const statement = useMemo(
    () => problem.statementMd ?? problem.statement ?? "",
    [problem.statementMd, problem.statement]
  );

  const hints = useMemo(
    () => (Array.isArray(problem.hints) ? problem.hints : []),
    [problem.hints]
  );

  return (
    <div className="grid gap-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{problem.title}</h1>
        {statement && (
          <div className="prose prose-sm max-w-none text-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {statement}
            </ReactMarkdown>
          </div>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-4">
          <StepComposer
            sessionId={initialSession.id}
            problemId={problem.id}
            onSubmit={appendStep}
          />
          <StepsFeed steps={steps} />
        </div>

        <aside className="grid gap-4">
          <HintLadder
            sessionId={initialSession.id}
            initialShown={hintsShown}
            hints={hints}
            onChange={setHintsShown}
          />
          <ProgressPanel
            status={status}
            steps={steps.length}
            hintsShown={hintsShown}
          />
        </aside>
      </div>
    </div>
  );
}
