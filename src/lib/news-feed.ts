/** External headlines are links to the publisher, never GazaWorks articles. */
export type NewsHeadline = {
  id: string;
  title: string;
  excerpt: string;
  source: "UN News" | "Al Jazeera";
  sourceDate: string;
  sourceUrl: string;
  language: "en";
};

export const NEWS_FEEDS = [
  { url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", source: "UN News", host: "news.un.org" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", host: "www.aljazeera.com" },
] as const;

const GAZA = /\b(gaza|gazans?|palestinians? in gaza)\b/i;
const WORK = /\b(work(?:ers?|force|places?)?|jobs?|livelihoods?|employ(?:ment|ees?|ers?)?|econom(?:y|ic|ics)|business(?:es)?|income|entrepreneur(?:s|ship)?|educat(?:ion|ional)|schools?|universit(?:y|ies)|train(?:ing|ees?)?|skills?|digital|technolog(?:y|ies)|startups?|rebuild(?:ing)?|reconstruct(?:ion)?|market(?:s|place)?|professionals?|freelanc(?:ers?|ing))\b/i;

function decodeEntities(input: string) {
  return input.replace(/&(#(?:x[\da-f]+|\d+)|amp|quot|apos|lt|gt);/gi, (full, code: string) => {
    const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? full;
    const number = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return number > 31 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
      ? String.fromCodePoint(number) : "";
  });
}

function plainText(raw: string) {
  return decodeEntities(raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ").trim();
}

function field(xml: string, name: string) {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return plainText(new RegExp(`<${safeName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safeName}>`, "i").exec(xml)?.[1] ?? "");
}

export function parseNewsFeed(xml: string, feed: (typeof NEWS_FEEDS)[number], now = new Date()): NewsHeadline[] {
  if (xml.length > 1_000_000 || /<!\s*(?:DOCTYPE|ENTITY)/i.test(xml) || !/<(?:rss|feed)\b/i.test(xml)) return [];
  const entries = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  const found: NewsHeadline[] = [];
  for (const item of entries.slice(0, 100)) {
    const title = field(item, "title").slice(0, 220);
    const description = field(item, "description").slice(0, 600);
    if (!GAZA.test(title + " " + description) || !WORK.test(title + " " + description)) continue;
    const rawLink = field(item, "link");
    let url: URL;
    try { url = new URL(rawLink); } catch { continue; }
    if (url.protocol !== "https:" || url.host !== feed.host || url.username || url.password || url.port) continue;
    const published = new Date(field(item, "pubDate"));
    if (!Number.isFinite(published.getTime()) || published.getTime() > now.getTime() + 86_400_000 ||
      published.getTime() < now.getTime() - 90 * 86_400_000) continue;
    url.hash = "";
    found.push({
      id: `feed-${feed.source}-${encodeURIComponent(url.pathname)}`,
      title,
      excerpt: description.slice(0, 190),
      source: feed.source,
      sourceDate: published.toISOString().slice(0, 10),
      sourceUrl: url.toString(),
      language: "en",
    });
  }
  return found;
}

export async function fetchNewsHeadlines(fetcher: typeof fetch = fetch, now = new Date()) {
  const results = await Promise.allSettled(NEWS_FEEDS.map(async (feed) => {
    const response = await fetcher(feed.url, {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/rss+xml,application/xml,text/xml", "User-Agent": "GazaWorks/1.0 (https://gazaworks.netlify.app)" },
      next: { revalidate: 3600 },
    });
    if (!response.ok || !/(?:xml|rss)/i.test(response.headers.get("content-type") ?? "")) return [];
    if (Number(response.headers.get("content-length")) > 1_000_000) return [];
    const reader = response.body?.getReader();
    if (!reader) return [];
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1_000_000) { await reader.cancel(); return []; }
      chunks.push(value);
    }
    return parseNewsFeed(new TextDecoder().decode(Buffer.concat(chunks)), feed, now);
  }));
  const deduped = new Map<string, NewsHeadline>();
  for (const result of results) {
    if (result.status === "fulfilled") for (const headline of result.value) deduped.set(headline.sourceUrl, headline);
  }
  return [...deduped.values()].sort((a, b) => b.sourceDate.localeCompare(a.sourceDate)).slice(0, 12);
}
