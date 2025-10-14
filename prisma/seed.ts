import { db } from "../lib/db";
import problems from "../app/data/gold-problems.json";

async function main() {
  for (const p of problems as any[]) {
    await db.problem.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`Seeded ${(problems as any[]).length} problems`);
}
main().finally(() => db.$disconnect());
