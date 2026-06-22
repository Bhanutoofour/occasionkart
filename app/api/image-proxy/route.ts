import { NextResponse } from "next/server";

export const runtime = "nodejs";
const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1541781286675-9bca0d6d7d07?auto=format&fit=crop&w=900&q=80";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^\[::1\]$/i,
];

function isBlockedHostname(hostname: string) {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function fallbackRedirect() {
  return NextResponse.redirect(FALLBACK_IMAGE_URL, { status: 302 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src")?.trim() ?? "";

  if (!src) {
    return NextResponse.json({ error: "Missing src query parameter." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid src URL." }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(target.protocol) || isBlockedHostname(target.hostname)) {
    return NextResponse.json({ error: "Blocked image source." }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return fallbackRedirect();
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return fallbackRedirect();
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return fallbackRedirect();
  }
}
