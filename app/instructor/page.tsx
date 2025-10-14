import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function InstructorHome() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = (sessionClaims as any)?.metadata?.role ?? "student";
  if (role !== "instructor" && role !== "admin") redirect("/");

  return (
    <section className="py-12">
      <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Assignments and analytics coming soon.
      </p>
    </section>
  );
}
