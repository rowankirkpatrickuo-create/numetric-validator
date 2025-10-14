"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Article = { slug: string; title: string; excerpt: string };

const ARTICLES: Article[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    excerpt: "Basics of Tutorbot.",
  },
  {
    slug: "privacy",
    title: "Privacy & data",
    excerpt: "What we collect and why.",
  },
  {
    slug: "teacher-mode",
    title: "Teacher mode",
    excerpt: "Class codes and dashboards.",
  },
];

export default function HelpCenter() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ARTICLES;
    return ARTICLES.filter((a) =>
      [a.title, a.excerpt].some((t) => t.toLowerCase().includes(needle))
    );
  }, [q]);

  return (
    <section className="py-12">
      <h1 className="text-3xl font-bold">Help Center</h1>
      <label className="mt-6 block max-w-md">
        <span className="sr-only">Search help</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          className="w-full rounded-md border px-3 py-2"
          aria-label="Search help articles"
        />
      </label>
      <ul className="mt-8 grid gap-4 md:grid-cols-2" role="list">
        {results.map((a) => (
          <li key={a.slug} className="rounded-lg border p-4">
            <h2 className="text-lg font-medium">
              <Link
                className="hover:underline"
                href={`/help/articles/${a.slug}`}
              >
                {a.title}
              </Link>
            </h2>
            <p className="text-gray-600 text-sm mt-1">{a.excerpt}</p>
          </li>
        ))}
        {results.length === 0 && (
          <li className="text-gray-600">
            No results for “{q}”. Try a different term.
          </li>
        )}
      </ul>
    </section>
  );
}
