"use client";

import { useState } from "react";

type SourceImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  eager?: boolean;
  onFailed?: () => void;
};

function proxyUrl(src: string) {
  return "/api/source-image?url=" + encodeURIComponent(src);
}

export function SourceImage({
  src,
  alt = "",
  className,
  eager = false,
  onFailed,
}: SourceImageProps) {
  const [mode, setMode] = useState<"direct" | "proxy" | "failed">("direct");

  if (!src || mode === "failed") {
    return null;
  }

  const currentSrc = mode === "direct" ? src : proxyUrl(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (mode === "direct") {
          setMode("proxy");
          return;
        }
        setMode("failed");
        onFailed?.();
      }}
    />
  );
}
