import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/source-image/route";

const request = (source: string) => new NextRequest(
  "https://gazaworks.netlify.app/api/source-image?url=" + encodeURIComponent(source),
);

afterEach(() => vi.unstubAllGlobals());

describe("source image proxy", () => {
  it("rejects arbitrary hosts and non-image paths before any network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await GET(request("https://www.aljazeera.net.evil.test/wp-content/uploads/a.jpg"))).status).toBe(403);
    expect((await GET(request("https://www.aljazeera.net/redirect?to=http://127.0.0.1"))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not follow an allowed source redirect to a different host", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("redirect blocked"));
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(request("https://www.aljazeera.net/wp-content/uploads/2026/08/picture.jpg"));
    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ redirect: "error" }));
  });

  it("rejects active image types and responses larger than the limit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } })));
    expect((await GET(request("https://www.undp.org/sites/g/files/image.jpg"))).status).toBe(415);

    const oversized = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(8 * 1024 * 1024 + 1));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(oversized, { headers: { "content-type": "image/jpeg" } })));
    expect((await GET(request("https://www.undp.org/sites/g/files/image.jpg"))).status).toBe(413);
  });

  it("returns an allowed raster image with a strict content type", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": "image/jpeg; charset=binary" },
    })));
    const response = await GET(request("https://www.aljazeera.net/wp-content/uploads/2026/08/picture.jpg"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3]);
  });
});
