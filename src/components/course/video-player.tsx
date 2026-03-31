"use client";

import { useEffect, useState } from "react";

interface VideoPlayerProps {
  courseId: string;
  lessonId: string;
}

export function VideoPlayer({ courseId, lessonId }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(
          `/api/video?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`
        );
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setEmbedUrl(data.embedUrl);
      } catch {
        setError(true);
      }
    }
    fetchVideo();
  }, [courseId, lessonId]);

  if (error) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load video.</p>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-card flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        loading="lazy"
        referrerPolicy="origin"
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
      />
    </div>
  );
}
