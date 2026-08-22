import { NextResponse } from "next/server";
import type { z, ZodIssue } from "zod";
import { auth } from "@/auth";

// Shared API helpers for /api/v1/*. Routes are thin: gate auth, parse body
// against a Zod schema, call the lib, return JSON. Errors thrown anywhere
// inside the route handler bubble up to handleError() which maps them to a
// consistent { error: { message, code, issues? } } shape.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
    public issues?: ZodIssue[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const Unauthorized = () => new ApiError(401, "auth", "unauthorized");
export const Forbidden = () => new ApiError(403, "forbidden", "forbidden");
export const NotFound = (msg = "not found") =>
  new ApiError(404, msg, "not_found");
export const BadRequest = (msg: string) =>
  new ApiError(400, msg, "bad_request");
export const Conflict = (msg: string) => new ApiError(409, msg, "conflict");
export const ServerError = (msg = "server error") =>
  new ApiError(500, msg, "server_error");

export interface ApiUser {
  userId: string;
  name?: string | null;
  email?: string | null;
  isAdmin: boolean;
}

export async function requireUser(): Promise<ApiUser> {
  const session = await auth();
  if (!session?.user?.id) throw Unauthorized();
  return {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    isAdmin: !!session.user.isAdmin,
  };
}

export async function requireAdmin(): Promise<ApiUser> {
  const user = await requireUser();
  if (!user.isAdmin) throw Forbidden();
  return user;
}

export async function parseJson<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw BadRequest("invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      422,
      "validation failed",
      "validation_error",
      parsed.error.issues,
    );
  }
  return parsed.data;
}

// Map exceptions to a uniform JSON error response. ApiError uses its declared
// status; plain Errors are inspected for known sentinel messages thrown by
// the lib layer (e.g. "forbidden", "not found", "Local not available").
export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: err.message,
          code: err.code,
          ...(err.issues ? { issues: err.issues } : {}),
        },
      },
      { status: err.status },
    );
  }
  if (err instanceof Error) {
    const msg = err.message;
    const lower = msg.toLowerCase();
    if (lower === "unauthorized") {
      return NextResponse.json(
        { error: { message: "auth", code: "unauthorized" } },
        { status: 401 },
      );
    }
    if (lower === "forbidden") {
      return NextResponse.json(
        { error: { message: "forbidden", code: "forbidden" } },
        { status: 403 },
      );
    }
    if (lower.includes("not found") || lower.includes("not available")) {
      return NextResponse.json(
        { error: { message: msg, code: "not_found" } },
        { status: 404 },
      );
    }
    if (lower.includes("already has")) {
      return NextResponse.json(
        { error: { message: msg, code: "conflict" } },
        { status: 409 },
      );
    }
    if (lower.startsWith("cannot ") || lower.includes("invalid")) {
      return NextResponse.json(
        { error: { message: msg, code: "bad_request" } },
        { status: 400 },
      );
    }
    // Unknown internal errors must not leak internals to the client.
    console.error("[api] unhandled error:", err);
    return NextResponse.json(
      { error: { message: "server error", code: "server_error" } },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { error: { message: "unknown error", code: "server_error" } },
    { status: 500 },
  );
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
