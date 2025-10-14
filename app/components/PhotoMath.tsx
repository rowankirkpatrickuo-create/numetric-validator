"use client";

import { useRef, useState } from "react";
// @ts-ignore - optional analytics
import posthog from "posthog-js";

type ResultMeta = {
  engine?: string;
  preprocess_ms?: number;
  ocr_ms?: number;
  bytes?: number;
};
type Result = {
  latex?: string;
  text?: string;
  warnings?: string[];
  meta?: ResultMeta;
};

export function PhotoMath({
  onInsertLatex,
}: {
  onInsertLatex?: (latex: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false); // NEW: toggle for long OCR text
  const [showDetails, setShowDetails] = useState(false); // NEW: toggle for engine/timings
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    inputRef.current?.click();
  }

  function fileToDataUrl(f: File): Promise<string> {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(f);
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setFile(f);
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
    setResult(null);
    setShowRaw(false);
    setShowDetails(false);
  }

  async function extract() {
    if (!preview || !file) return;
    setLoading(true);
    setErr(null);
    setShowRaw(false);
    setShowDetails(false);

    try {
      const fd = new FormData();
      fd.append("image", file); // server expects "image"

      const r = await fetch("/api/vision", { method: "POST", body: fd });

      const ct = r.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await r.json()
        : { error: "non_json_response" };

      if (!r.ok || (payload as any)?.error) {
        const msg = (payload as any)?.error || "Extraction failed.";
        setErr(msg);
        setResult(null);
        posthog?.capture?.("photo_math_error", {
          error: msg,
          status: r.status,
        });
        return;
      }

      const j = payload as Result;
      setResult(j);

      // Analytics with engine/timing if provided
      posthog?.capture?.("photo_math_extracted", {
        hasLatex: !!j?.latex,
        hasText: !!j?.text,
        engine: j?.meta?.engine,
        preprocess_ms: j?.meta?.preprocess_ms,
        ocr_ms: j?.meta?.ocr_ms,
        bytes: j?.meta?.bytes,
      });

      // Auto-insert LaTeX
      if (j?.latex?.trim()) {
        const latex = j.latex.trim();
        onInsertLatex?.(latex);
        window.dispatchEvent(
          new CustomEvent("tutorbot:insertLatex", { detail: latex })
        );
      }
    } catch {
      setErr("Network error.");
      setResult(null);
      posthog?.capture?.("photo_math_error", { error: "network" });
    } finally {
      setLoading(false);
    }
  }

  async function copyLatex() {
    if (result?.latex) {
      await navigator.clipboard.writeText(result.latex);
      posthog?.capture?.("photo_math_copied");
      alert("LaTeX copied!");
    }
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Photo to Math</h2>
        <button
          onClick={pickFile}
          className="text-xs underline"
          aria-label="Choose image"
        >
          Choose image
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*;capture=environment"
        className="hidden"
        onChange={onFile}
      />

      {!preview && (
        <p className="text-sm text-gray-500">
          Upload a photo or take one with your camera.
        </p>
      )}

      {preview && (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Selected"
            className="max-h-48 w-full rounded-md object-contain border bg-white"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={extract}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-white text-sm disabled:opacity-60"
            >
              {loading ? "Extracting…" : "Extract math"}
            </button>

            {result?.latex && (
              <>
                <button
                  onClick={copyLatex}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Copy LaTeX
                </button>
                {onInsertLatex && (
                  <button
                    onClick={() => onInsertLatex(result.latex!)}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Insert into editor
                  </button>
                )}
              </>
            )}
          </div>

          {err && <div className="text-xs text-red-700">{err}</div>}

          {result && (
            <div className="rounded-md border bg-white/60 p-3 text-xs space-y-2">
              {/* Clean, short preview */}
              {result.latex && (
                <div className="flex items-start gap-1">
                  <span className="font-medium text-gray-800">LaTeX:</span>
                  <code className="break-all text-gray-800">
                    {result.latex}
                  </code>
                </div>
              )}

              {/* Small details row (collapsed by default) */}
              {(result.meta?.engine || result.meta?.ocr_ms != null) && (
                <div>
                  <button
                    onClick={() => setShowDetails((s) => !s)}
                    className="text-[11px] text-blue-700 hover:underline"
                  >
                    {showDetails ? "Hide details" : "Show details"}
                  </button>
                  {showDetails && (
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-gray-600">
                      {result.meta?.engine && (
                        <div>
                          <span className="font-medium">Engine:</span>{" "}
                          {result.meta.engine}
                        </div>
                      )}
                      {typeof result.meta?.ocr_ms === "number" && (
                        <div>
                          <span className="font-medium">OCR:</span>{" "}
                          {result.meta.ocr_ms} ms
                        </div>
                      )}
                      {typeof result.meta?.preprocess_ms === "number" && (
                        <div>
                          <span className="font-medium">Preprocess:</span>{" "}
                          {result.meta.preprocess_ms} ms
                        </div>
                      )}
                      {typeof result.meta?.bytes === "number" && (
                        <div>
                          <span className="font-medium">Image:</span>{" "}
                          {(result.meta.bytes / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible raw OCR text (kept, but hidden by default) */}
              {result.text && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowRaw((s) => !s)}
                    className="text-[11px] text-blue-700 hover:underline"
                  >
                    {showRaw ? "Hide OCR text" : "Show OCR text"}
                  </button>
                  {showRaw && (
                    <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded border bg-white p-2 text-[11px] leading-snug text-gray-700">
                      {result.text}
                    </pre>
                  )}
                </div>
              )}

              {result.warnings?.length ? (
                <ul className="list-disc pl-5 text-amber-700">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
