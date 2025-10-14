// app/sessions/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SessionWorkspace from "@/components/SessionWorkspace";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  const session = await db.session.findUnique({
    where: { id: params.id },
    include: { Problem: true }, // <- was { problem: true }
  });

  if (!session || session.userId !== userId) notFound();

  return (
    <section className="mx-auto max-w-3xl p-4 md:p-6 space-y-4">
      <SessionWorkspace
        initialSession={session as any}
        problem={(session as any).Problem} // <- was .problem
      />
    </section>
  );
}
