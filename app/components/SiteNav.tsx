"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function SiteNav() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-brand-border bg-white/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ---------- Logo ---------- */}
        <Link
          href="/"
          data-cta="nav_home"
          className="flex items-center gap-3 font-semibold tracking-tight text-brand-navy"
          aria-label="Numetric home"
        >
          <Image
            src="/brand/numetric-shield.png"
            width={36}
            height={36}
            alt="Numetric shield"
            priority
          />
          <span className="text-xl font-bold">Numetric</span>
        </Link>

        {/* ---------- Nav Links ---------- */}
        <nav
          aria-label="Main"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <Link
            className="text-brand-navy hover:text-brand-green transition-colors"
            href="/pricing"
            data-cta="nav_pricing"
          >
            Pricing
          </Link>
          <Link
            className="text-brand-navy hover:text-brand-green transition-colors"
            href="/edu"
            data-cta="nav_edu"
          >
            For Institutions
          </Link>
          <Link
            className="text-brand-navy hover:text-brand-green transition-colors"
            href="/help"
            data-cta="nav_help"
          >
            Help
          </Link>

          {/* ---------- Auth State ---------- */}
          <ClerkLoading>
            <Link
              className="text-brand-navy hover:text-brand-green transition-colors"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="rounded-md border border-brand-navy px-3 py-1.5 text-brand-navy hover:bg-brand-bg transition-colors"
              href="/sign-up"
            >
              Sign up
            </Link>
          </ClerkLoading>

          <ClerkLoaded>
            <SignedOut>
              <Link
                className="text-brand-navy hover:text-brand-green transition-colors"
                href="/sign-in"
              >
                Sign in
              </Link>
              <Link
                className="rounded-md border border-brand-navy px-3 py-1.5 text-brand-navy hover:bg-brand-bg transition-colors"
                href="/sign-up"
              >
                Sign up
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                className="text-brand-navy hover:text-brand-green transition-colors"
                href="/account"
              >
                Account
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </ClerkLoaded>
        </nav>
      </div>
    </header>
  );
}
