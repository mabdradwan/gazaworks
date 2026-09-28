import { fetchNewsHeadlines } from "@/lib/news-feed";

export const runtime = "nodejs";
export async function GET() {
  const items = await fetchNewsHeadlines();
  return Response.json({ items }, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
