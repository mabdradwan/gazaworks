import { describe, expect, it, vi } from "vitest";
import { fetchNewsHeadlines, NEWS_FEEDS, parseNewsFeed } from "../src/lib/news-feed";

const date = new Date("2026-09-28T12:00:00Z");
const item = (title: string, link = "https://news.un.org/en/story/2026/09/example") =>
  `<item><title>${title}</title><description><![CDATA[Skills and employment in Gaza.]]></description><link>${link}</link><pubDate>Sun, 27 Sep 2026 12:00:00 GMT</pubDate></item>`;

describe("publisher news feed", () => {
  it("selects relevant stories, preserves original attribution and date", () => {
    const news = parseNewsFeed(`<rss><channel>${item("Gaza workers rebuild livelihoods")}</channel></rss>`, NEWS_FEEDS[0], date);
    expect(news).toMatchObject([{ source: "UN News", sourceDate: "2026-09-27", title: "Gaza workers rebuild livelihoods", language: "en" }]);
  });
  it("rejects links to another domain, active content and unrelated headlines", () => {
    const xml = `<rss><channel>${item("Gaza skills", "https://evil.example/steal")}${item("Sports finals", "https://news.un.org/en/story/sports")}<!DOCTYPE html></channel></rss>`;
    expect(parseNewsFeed(xml, NEWS_FEEDS[0], date)).toEqual([]);
    expect(parseNewsFeed(`<rss>${item("Gaza skills", "https://evil.example/")}</rss>`, NEWS_FEEDS[0], date)).toEqual([]);
  });
  it("drops future dates and stale stories", () => {
    expect(parseNewsFeed(`<rss>${item("Gaza education").replace("27 Sep 2026", "27 Sep 2024")}</rss>`, NEWS_FEEDS[0], date)).toEqual([]);
  });
  it("returns the working feed if another publisher fails", async () => {
    const mock = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(new Response(`<rss>${item("Gaza jobs", "https://www.aljazeera.com/news/2026/09/jobs")}</rss>`, { headers: { "Content-Type": "application/rss+xml" } }));
    expect(await fetchNewsHeadlines(mock, date)).toMatchObject([{ source: "Al Jazeera" }]);
  });
  it("rejects an oversized feed before parsing", async () => {
    const mock = vi.fn<typeof fetch>().mockResolvedValue(new Response("<rss/>", { headers: { "content-type": "application/xml", "content-length": "2000000" } }));
    expect(await fetchNewsHeadlines(mock, date)).toEqual([]);
  });
});
