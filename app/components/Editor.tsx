"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.css";

import type { MathfieldElement } from "mathlive";
import { formatForMath, sanitize, FbChoice } from "@/lib/text-math";

export default function Editor() {
  // editor state
  const [latex, setLatex] = useState("");
  const [editorMode, setEditorMode] = useState<"text" | "math">("text");

  // tutor response
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");

  // feedback
  const [fbChoice, setFbChoice] = useState<FbChoice>("");
  const [fbNotes, setFbNotes] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const [fbThanks, setFbThanks] = useState("");

  const mfRef = useRef<MathfieldElement | null>(null);

  // Load MathLive on client & start in text with smartMode
  useEffect(() => {
    let mounted = true;
    import("mathlive")
      .then(() => {
        if (!mounted) return;
        const mf = mfRef.current;
        if (mf) {
          mf.smartMode = true;
          mf.mode = "text";
          setEditorMode("text");
        }
      })
      .catch((e) => console.error("MathLive load error:", e));
    return () => {
      mounted = false;
    };
  }, []);

  // keep MathLive mode in sync
  useEffect(() => {
    const mf = mfRef.current;
    if (mf) {
      mf.mode = editorMode;
      mf.focus();
    }
  }, [editorMode]);

  // helper to insert LaTeX into MathLive (with safe fallbacks)
  const insertLatex = (snippet: string) => {
    const s = snippet || "";
    const mf = mfRef.current;
    setEditorMode("math");
    if (mf) {
      try {
        mf.mode = "math";
        mf.focus();
        if (typeof (mf as any).insert === "function") {
          (mf as any).insert(s);
        } else {
          mf.value = (mf.value || "") + s;
        }
        setLatex(mf.value ?? "");
        return;
      } catch (e) {
        console.warn("MathLive insert failed, falling back to state:", e);
      }
    }
    setLatex((prev) => (prev ? prev + " " + s : s));
  };

  // ⬇️ Listen for PhotoMath events and auto-insert
  useEffect(() => {
    function onInsert(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (!detail) return;
      insertLatex(detail);
    }
    window.addEventListener("tutorbot:insertLatex", onInsert as EventListener);
    return () =>
      window.removeEventListener(
        "tutorbot:insertLatex",
        onInsert as EventListener
      );
  }, []);

  // quick helpers
  const sym = (s: string) => insertLatex(s);
  const xSup = () => insertLatex("x^{ }");
  const aSub = () => insertLatex("a_{ }");
  const frac = () => insertLatex("\\frac{ }{ }");
  const sqrt = () => insertLatex("\\sqrt{ }");
  const sum = () => insertLatex("\\sum_{i=1}^{n}{ }");
  const integral = () => insertLatex("\\int_{a}^{b}\\, ");
  const limit = () => insertLatex("\\lim_{x\\to a}\\, ");
  const vector = () => insertLatex("\\vec{v}");
  const matrix2 = () =>
    insertLatex("\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}");

  // Cmd/Ctrl+M toggles math/text
  const onKeyDownContainer = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
      e.preventDefault();
      setEditorMode((m) => (m === "text" ? "math" : "text"));
    }
  };

  // Submit to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = sanitize(latex.trim());
    if (!q) return;

    setIsLoading(true);
    setResponse("");
    setFbChoice("");
    setFbNotes("");
    setFbThanks("");
    setLastQuestion(q);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          tutorMode: "socratic_algebra_calc1",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const raw =
        data?.content ?? data?.answer ?? data?.message ?? "No answer.";
      setResponse(formatForMath(String(raw)));
    } catch (err) {
      console.error(err);
      setResponse("⚠️ Network or server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Feedback -> localStorage (placeholder)
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response || !lastQuestion || !fbChoice) return;

    const payload = {
      questionLatex: lastQuestion,
      answer: response,
      correct: fbChoice === "correct",
      suggestion: fbNotes.trim(),
      timestamp: new Date().toISOString(),
    };

    setFbSending(true);
    setFbThanks("");
    try {
      const key = "tutorFeedback";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push(payload);
      localStorage.setItem(key, JSON.stringify(prev));
      setFbThanks("Thanks for the feedback! 💙");
      setFbChoice("");
      setFbNotes("");
    } catch {
      setFbThanks("Couldn’t send feedback right now, saved locally.");
    } finally {
      setFbSending(false);
    }
  };

  return (
    <div className="app space-y-4" onKeyDown={onKeyDownContainer}>
      {/* Toggle */}
      <div className="segmented" role="group" aria-label="Editor mode">
        <button
          type="button"
          className={`seg-btn ${editorMode === "text" ? "seg-selected" : ""}`}
          onClick={() => setEditorMode("text")}
          title="Type normal sentences. (Cmd/Ctrl+M toggles)"
        >
          Text
        </button>
        <button
          type="button"
          className={`seg-btn ${editorMode === "math" ? "seg-selected" : ""}`}
          onClick={() => setEditorMode("math")}
          title="Enter formulas with a math keyboard."
        >
          Math
        </button>
        <span className="seg-hint">Smart mode often switches for you.</span>
      </div>

      {/* Tools */}
      <div className="tools">
        <details>
          <summary className="tools-trigger">Math tools ▾</summary>
          <div className="tools-menu">
            <details>
              <summary className="tools-section">Common symbols</summary>
              <div className="tools-row">
                {[
                  "π",
                  "θ",
                  "∞",
                  "±",
                  "≈",
                  "≤",
                  "≥",
                  "×",
                  "÷",
                  "√",
                  "°",
                  "→",
                  "←",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="symbol-btn"
                    onClick={() => sym(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </details>

            <details>
              <summary className="tools-section">Greek letters</summary>
              <div className="tools-row">
                {["α", "β", "γ", "Δ", "λ", "μ", "σ", "φ", "ω"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="symbol-btn"
                    onClick={() => sym(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </details>

            <details open>
              <summary className="tools-section">LaTeX snippets</summary>
              <div className="tools-row">
                <button className="symbol-btn" type="button" onClick={xSup}>
                  x^2
                </button>
                <button className="symbol-btn" type="button" onClick={aSub}>
                  a_i
                </button>
                <button className="symbol-btn" type="button" onClick={frac}>
                  frac
                </button>
                <button className="symbol-btn" type="button" onClick={sqrt}>
                  sqrt
                </button>
                <button className="symbol-btn" type="button" onClick={sum}>
                  sum
                </button>
                <button className="symbol-btn" type="button" onClick={integral}>
                  int
                </button>
                <button className="symbol-btn" type="button" onClick={limit}>
                  lim
                </button>
                <button className="symbol-btn" type="button" onClick={vector}>
                  vec
                </button>
                <button className="symbol-btn" type="button" onClick={matrix2}>
                  matrix
                </button>
              </div>
            </details>
          </div>
        </details>
      </div>

      {/* Editor */}
      <form onSubmit={handleSubmit} className="text-prompt-input space-y-3">
        <math-field
          ref={mfRef as unknown as React.Ref<MathfieldElement>}
          className="mathfield"
          value={latex}
          virtualKeyboardMode="onfocus"
          onInput={(e) => setLatex((e.target as any).value ?? "")}
        ></math-field>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button type="submit" disabled={!latex.trim() || isLoading}>
            {isLoading ? "Thinking…" : "Ask Tutor"}
          </button>
        </div>
      </form>

      {/* Preview */}
      {latex.trim() && (
        <div className="preview">
          <strong>Preview:</strong>
          <div className="md">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {`$$${latex}$$`}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Answer + feedback */}
      {response && (
        <>
          <div className="response">
            <strong>Answer:</strong>
            <div className="md">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {response}
              </ReactMarkdown>
            </div>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="feedback">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Was this answer correct?
            </div>
            <div className="fb-actions">
              <button
                type="button"
                onClick={() => setFbChoice("correct")}
                className={`fb-btn ${
                  fbChoice === "correct" ? "fb-selected" : ""
                }`}
                disabled={fbSending}
                aria-pressed={fbChoice === "correct"}
              >
                ✅ Correct
              </button>
              <button
                type="button"
                onClick={() => setFbChoice("incorrect")}
                className={`fb-btn ${
                  fbChoice === "incorrect" ? "fb-selected" : ""
                }`}
                disabled={fbSending}
                aria-pressed={fbChoice === "incorrect"}
              >
                ❌ Incorrect
              </button>
            </div>

            <label style={{ display: "block", marginTop: 10 }}>
              <span style={{ display: "block", marginBottom: 6 }}>
                Suggestions (optional)
              </span>
              <textarea
                className="fb-notes"
                placeholder="Tell us what was helpful or what should be improved…"
                value={fbNotes}
                onChange={(e) => setFbNotes(e.target.value)}
                rows={3}
                disabled={fbSending}
              />
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                type="submit"
                disabled={!fbChoice || fbSending}
                className="fb-submit"
              >
                {fbSending ? "Sending…" : "Submit Feedback"}
              </button>
              {fbThanks && <span className="fb-thanks">{fbThanks}</span>}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
