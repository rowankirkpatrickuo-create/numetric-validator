"use client";

import { SignedIn, SignedOut, UserProfile } from "@clerk/nextjs";
import Link from "next/link";

export default function AccountPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your profile, security, and data.
        </p>
      </header>

      <SignedOut>
        <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
          <p className="text-gray-700">
            Please{" "}
            <Link href="/sign-in" className="underline">
              sign in
            </Link>{" "}
            to view your account.
          </p>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
          <UserProfile
            appearance={{
              variables: { colorPrimary: "#2563eb" }, // Tailwind blue-600
            }}
            /* Optional: route overrides if you want */
            // path="/account"
            // routing="path"
          />
        </div>
      </SignedIn>
    </section>
  );
}
