// app/api/vision/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import type { Worker as TesseractWorker } from "tesseract.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ok = { latex: string; text?: string; warnings?: string[]; meta?: any };
type Err = { error: string };

function bad(status: number, error: string) {
  return NextResponse.json<Err>({ error }, { status });
}

/* -------------------- Utilities -------------------- */

async function preprocess(buf: Buffer) {
  // Light, fast cleanup for OCR.
  return await sharp(buf).grayscale().normalise().threshold().toBuffer();
}

function parseDataUrlToBuffer(dataUrl: string): { mime: string; buf: Buffer } {
  const m = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!m) throw new Error("Invalid dataUrl");
  const mime = m[1];
  const buf = Buffer.from(m[2], "base64");
  return { mime, buf };
}

/* -------------------- OCR engines -------------------- */

async function runWithMathpix(buf: Buffer): Promise<string> {
  const appId = process.env.MATHPIX_APP_ID;
  const appKey = process.env.MATHPIX_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Mathpix not configured (MATHPIX_APP_ID/KEY missing)");
  }
  const imageBase64 = buf.toString("base64");
  const res = await fetch("https://api.mathpix.com/v3/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      app_id: appId,
      app_key: appKey,
    } as any,
    body: JSON.stringify({
      src: `data:image/png;base64,${imageBase64}`,
      formats: ["latex_simplified"],
      math_inline_delimiters: ["$", "$"],
      rm_spaces: true,
      include_svg: false,
    }),
  });
  if (!res.ok)
    throw new Error(`Mathpix error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const latex =
    json.latex_simplified || json.latex_styled || json.latex || json.text;
  if (!latex) throw new Error("Mathpix returned no LaTeX");
  return String(latex).trim();
}

async function runWithPix2Tex(buf: Buffer): Promise<string> {
  const url = process.env.PIX2TEX_URL; // e.g., http://localhost:5000/latex
  if (!url) throw new Error("PIX2TEX_URL not configured");
  const b64 = buf.toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: `data:image/png;base64,${b64}` }),
  });
  if (!res.ok)
    throw new Error(`pix2tex error ${res.status}: ${await res.text()}`);
  const j = await res.json().catch(() => ({}));
  const latex = j.latex || j.result || j.text;
  if (!latex) throw new Error("pix2tex returned no LaTeX");
  return String(latex).trim();
}

let _worker: any = null; // cache across invocations

async function getTesseractWorker(): Promise<any> {
  const { createWorker } = await import("tesseract.js");
  if (_worker) return _worker;

  // Cast to any → avoids type errors on loadLanguage / initialize
  _worker = (await createWorker()) as any;

  await _worker.loadLanguage("eng");
  await _worker.initialize("eng");

  return _worker;
}

async function runWithTesseract(buf: Buffer): Promise<string> {
  // Note: returns plain text, not LaTeX.
  const worker = await getTesseractWorker();
  const { data } = await worker.recognize(buf);
  const text = (data?.text || "").trim();
  if (!text) throw new Error("Tesseract returned empty text");
  return text;
}

async function runOcrToLatex(
  buf: Buffer
): Promise<{ latex: string; warnings: string[] }> {
  const engine = (process.env.OCR_ENGINE || "mathpix").toLowerCase();
  const warnings: string[] = [];

  if (engine === "mathpix") {
    return { latex: await runWithMathpix(buf), warnings };
  }
  if (engine === "pix2tex") {
    return { latex: await runWithPix2Tex(buf), warnings };
  }
  if (engine === "tesseract") {
    warnings.push("Tesseract engine returns plain text, not LaTeX.");
    return { latex: await runWithTesseract(buf), warnings };
  }
  throw new Error(`Unknown OCR_ENGINE: ${engine}`);
}

/* -------------------- Main handler -------------------- */

export async function POST(req: Request) {
  try {
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    let rawBuf: Buffer | null = null;

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image") as File | null;
      if (!file) return bad(400, "No 'image' file in multipart form-data");
      const arr = await file.arrayBuffer();
      rawBuf = Buffer.from(arr);
    } else if (ct.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      const dataUrl = body?.dataUrl;
      if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
        return bad(400, "Expected JSON { dataUrl: 'data:image/*;base64,...' }");
      }
      rawBuf = parseDataUrlToBuffer(dataUrl).buf;
    } else {
      return bad(
        400,
        "Unsupported Content-Type. Use multipart/form-data or application/json."
      );
    }

    if (!rawBuf?.length) return bad(400, "Empty image payload");
    if (rawBuf.length > 8 * 1024 * 1024)
      return bad(413, "Image too large (max 8MB)");

    const t0 = Date.now();
    const buf = await preprocess(rawBuf);
    const t1 = Date.now();
    const { latex, warnings } = await runOcrToLatex(buf);
    const t2 = Date.now();

    // Plain-text convenience (strip $ if present)
    const text = String(latex).replace(/\$/g, "");

    return NextResponse.json<Ok>({
      latex,
      text,
      warnings,
      meta: {
        preprocess_ms: t1 - t0,
        ocr_ms: t2 - t1,
        engine: (process.env.OCR_ENGINE || "mathpix").toLowerCase(),
        bytes: rawBuf.length,
      },
    });
  } catch (e: any) {
    console.error("[/api/vision] error:", e);
    return bad(500, e?.message ?? "OCR failed");
  }
}
