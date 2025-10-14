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
    include: { Problem: true }, // <- matches your Prisma relation name
  });

  if (!session || session.userId !== userId || !session.Problem) notFound();

  return (
    <section className="mx-auto max-w-3xl p-4 md:p-6 space-y-4">
      <SessionWorkspace
        initialSession={{
          id: session.id,
          status: session.status as any,
          hintsShown: session.hintsShown ?? 0,
          steps: (session.steps as any[]) ?? [],
          problemId: session.problemId!,
        }}
        problem={{
          id: session.Problem.id,
          title: session.Problem.title,
          statementMd: session.Problem.statementMd ?? "",
          hints: Array.isArray(session.Problem.hints)
            ? (session.Problem.hints as any)
            : [],
        }}
      />
    </section>
  );
}
