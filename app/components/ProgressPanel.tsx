"use client";

export default function ProgressPanel({
  status,
  steps,
  hintsShown,
}: {
  status: "active" | "completed" | "abandoned" | string;
  steps: number;
  hintsShown: number;
}) {
  const badgeClass =
    status === "completed"
      ? "bg-green-50 text-green-800 border-green-200"
      : status === "abandoned"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-gray-50 text-gray-800 border-gray-200";

  return (
    <div
      className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur text-sm"
      aria-labelledby="progress-title"
    >
      <div className="flex items-center justify-between">
        <h2 id="progress-title" className="font-semibold">
          Progress
        </h2>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass}`}
        >
          {status}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        <li>
          Steps: <span className="font-medium">{steps}</span>
        </li>
        <li>
          Hints revealed: <span className="font-medium">{hintsShown}</span>
        </li>
      </ul>
    </div>
  );
}
