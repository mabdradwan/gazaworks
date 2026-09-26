import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["www.aljazeera.net", "www.undp.org"]);
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("url");
  if (!value) return new Response("Missing image URL", { status: 400 });

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  const allowedPath = url.hostname === "www.aljazeera.net"
    ? url.pathname.startsWith("/wp-content/uploads/")
    : url.pathname.startsWith("/sites/g/files/");
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname) || !allowedPath || url.username || url.password || url.port) {
    return new Response("Source host is not allowed", { status: 403 });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "error", // A source must never redirect the server to another host.
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GazaWorksBot/1.0; +https://gazaworks.netlify.app)",
        Accept: "image/avif,image/webp,image/jpeg,image/png",
        Referer: url.origin + "/",
      },
      next: { revalidate: 86400 },
    });
  } catch {
    return new Response("Source image unavailable", { status: 502 });
  }

  if (!response.ok) return new Response("Source image unavailable", { status: 502 });

  const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) {
    return new Response("Source did not return an image", { status: 415 });
  }

  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_BYTES) {
    return new Response("Source image is too large", { status: 413 });
  }

  if (!response.body) return new Response("Source image unavailable", { status: 502 });
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        return new Response("Source image is too large", { status: 413 });
      }
      chunks.push(value);
    }
  } catch {
    return new Response("Source image unavailable", { status: 502 });
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
