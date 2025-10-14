// app/page.tsx
import Image from "next/image";
import { PracticePanel } from "@/components/PracticePanel";

export default function HomePage() {
  return (
    <section className="py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Left: hero copy */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-bg px-3 py-1 text-xs text-brand-navy">
            <Image
              src="/brand/numetric-shield.png"
              width={16}
              height={16}
              alt="Numetric"
              priority
            />
            Learn by steps, not shortcuts
          </div>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-brand-navy">
            Learn by doing.{" "}
            <span className="text-brand-green">Hints first</span>, answers last.
          </h1>

          <p className="mt-4 max-w-prose text-slate-600">
            Numetric guides students step-by-step with Socratic hints and a
            validator-checked engine.
          </p>

          <div className="mt-8 flex gap-3">
            {/* Primary CTA */}
            <a href="/app" data-cta="try_numetric" className="btn-primary">
              Try Numetric
            </a>

            {/* Secondary CTA */}
            <a href="/edu" data-cta="for_institutions" className="btn-outline">
              For Institutions
            </a>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-gold" />
            Validator ✓ SymPy • Privacy-first • PostHog analytics
          </div>
        </div>

        {/* Right: live practice panel */}
        <div className="overflow-y-auto rounded-xl border bg-white/60 p-4 shadow-soft backdrop-blur">
          <PracticePanel />
        </div>
      </div>
    </section>
  );
}
