"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-4">
      <div className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{ variables: { colorPrimary: "#2563eb" } }}
        />
      </div>
    </section>
  );
}
