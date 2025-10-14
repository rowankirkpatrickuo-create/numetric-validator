"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-4">
      <div className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          appearance={{ variables: { colorPrimary: "#2563eb" } }} // blue-600
        />
      </div>
    </section>
  );
}
