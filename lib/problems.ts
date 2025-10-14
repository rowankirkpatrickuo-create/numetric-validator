// lib/problems.ts
export const asTags = (x: unknown): string[] =>
  Array.isArray(x) ? (x as string[]) : [];
export const asHints = <T extends { id: string; text: string }>(
  x: unknown
): T[] => (Array.isArray(x) ? (x as T[]) : []);
export const pick = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];
