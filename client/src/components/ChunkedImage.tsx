import { useEffect, useMemo, useState } from "react";

interface ChunkedImageProps {
  chunks: string[];
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: "eager" | "lazy";
}

export default function ChunkedImage({
  chunks,
  alt,
  className = "",
  fallbackClassName = "",
  loading = "lazy",
}: ChunkedImageProps) {
  const [src, setSrc] = useState<string>("");
  const key = useMemo(() => chunks.join("|"), [chunks]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      key.split("|").filter(Boolean).map(async (path) => {
        const response = await fetch(path, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Image chunk failed: ${path}`);
        return (await response.text()).trim();
      }),
    )
      .then((parts) => {
        if (!cancelled) setSrc(`data:image/webp;base64,${parts.join("")}`);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!src) {
    return (
      <div
        aria-label={alt}
        className={`relative overflow-hidden bg-[#0B1426] ${fallbackClassName} ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(0,229,204,0.12),transparent_55%)]" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} loading={loading} decoding="async" />;
}
