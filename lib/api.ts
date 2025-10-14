// lib/api.ts
import { NextResponse } from "next/server";

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export class BadRequest extends HttpError {
  constructor(message = "Bad Request", code?: string) {
    super(400, message, code);
  }
}
export class Unauthorized extends HttpError {
  constructor(message = "Unauthorized", code?: string) {
    super(401, message, code);
  }
}
export class Forbidden extends HttpError {
  constructor(message = "Forbidden", code?: string) {
    super(403, message, code);
  }
}
export class NotFound extends HttpError {
  constructor(message = "Not Found", code?: string) {
    super(404, message, code);
  }
}

export function ok<T extends object>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function fail(
  message: string,
  status = 500,
  extra?: Record<string, unknown>
) {
  const payload: Record<string, unknown> = {
    ok: false,
    error: message,
    ...extra,
  };
  return NextResponse.json(payload, { status });
}

export function withErrors<H extends (req: Request, ctx?: any) => any>(
  handler: H
) {
  return (async (req: Request, ctx?: any) => {
    try {
      const res = await handler(req, ctx);
      return res ?? ok({ result: "ok" });
    } catch (err: any) {
      console.error("[API ERROR]", err);
      if (err?.status) return fail(err.message, err.status, { code: err.code });
      const stack =
        process.env.NODE_ENV !== "production"
          ? String(err?.stack || "")
          : undefined;
      return fail(err?.message || "Server error", 500, { stack });
    }
  }) as unknown as H;
}

export async function readJson<T = any>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new BadRequest("Invalid JSON body", "INVALID_JSON");
  }
}
