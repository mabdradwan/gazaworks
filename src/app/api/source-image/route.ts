import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["www.aljazeera.net", "www.undp.org"]);

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

  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response("Source host is not allowed", { status: 403 });
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; GazaWorksBot/1.0; +https://gazaworks.netlify.app)",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: url.origin + "/",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return new Response("Source image unavailable", { status: 502 });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    return new Response("Source did not return an image", { status: 415 });
  }

  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 8 * 1024 * 1024) {
    return new Response("Source image is too large", { status: 413 });
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
