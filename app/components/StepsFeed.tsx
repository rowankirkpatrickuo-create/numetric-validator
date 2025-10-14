"use client";
import type { Step } from "@/components/SessionWorkspace";

export default function StepsFeed({ steps }: { steps: Step[] }) {
  if (!steps?.length) {
    return (
      <div className="rounded-2xl border bg-white/70 p-4 text-sm text-gray-500">
        Your steps will appear here.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border bg-white p-0 overflow-hidden">
      <ol className="divide-y">
        {steps.map((s, i) => (
          <li key={i} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {s.kind === "math" ? "Math" : "Text"} step
              </span>
              <span className="text-gray-500">
                {new Date(s.ts).toLocaleTimeString()}
              </span>
            </div>
            {"text" in s && s.kind === "text" ? (
              <p className="mt-1 whitespace-pre-wrap">{(s as any).text}</p>
            ) : (
              <code className="mt-1 block whitespace-pre-wrap text-sm">
                {(s as any).latex}
              </code>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
