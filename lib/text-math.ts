/* Helpers shared by the editor */

const unFence = (s: string) =>
  s.replace(/```(?:math|latex)?\n([\s\S]*?)\n```/g, "$1");

const normalizeMathDelimiters = (s: string) =>
  s
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

export const formatForMath = (s: string) => normalizeMathDelimiters(unFence(s));
export const sanitize = (s: string) => s.slice(0, 8000);

export type FbChoice = "" | "correct" | "incorrect";
