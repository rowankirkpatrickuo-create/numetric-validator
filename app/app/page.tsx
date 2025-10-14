"use client";

import dynamic from "next/dynamic";
import { RoleBanner } from "../components/RoleBanner";
import { useIdentify } from "../(hooks)/useIdentify";
import { PhotoMath } from "../components/PhotoMath";
import { PracticePanel } from "../components/PracticePanel";

// ✅ Lazy-load the Editor to avoid SSR issues
const Editor = dynamic(() => import("../components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[320px] place-items-center rounded-xl border bg-white/70 shadow-sm">
      <div className="animate-pulse text-sm text-gray-500">Loading editor…</div>
    </div>
  ),
});

export default function AppEditorPage() {
  useIdentify();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header (simplified) */}
      <header className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Connected
        </span>
      </header>

      {/* Main grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Editor */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
            <RoleBanner />
            <Editor />
          </div>
        </div>

        {/* Right: Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          {/* Photo → Math extraction */}
          <PhotoMath />

          {/* Practice problems panel */}
          <PracticePanel />
        </aside>
      </div>
    </section>
  );
}
