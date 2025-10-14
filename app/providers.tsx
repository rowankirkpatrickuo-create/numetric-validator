"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export default function PHProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // One-time init + delegated CTA tracking
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // no-op if not configured

    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: false, // we'll do SPA pageviews manually
      loaded: () => posthog.capture("session_started", { surface: "web" }),
      // person_profiles: 'identified_only', // uncomment later if you use identify()
    });

    // Delegated CTA click listener (tracks [data-cta], <a>, <button>)
    const onClick = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;

      const el =
        target.closest<HTMLElement>("[data-cta]") ||
        target.closest<HTMLAnchorElement>("a") ||
        target.closest<HTMLButtonElement>("button");

      if (!el) return;

      const name =
        el.getAttribute("data-cta") ||
        el.getAttribute("aria-label") ||
        (el.textContent || "").trim() ||
        "unknown";

      const href =
        (el as HTMLAnchorElement).href || el.getAttribute("href") || undefined;

      posthog.capture("cta_clicked", {
        name,
        href,
        path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // SPA pageviews on route/query changes
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
