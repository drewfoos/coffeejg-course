"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

interface VideoPlayerProps {
  courseId: string;
  lessonId: string;
}

export function VideoPlayer({ courseId, lessonId }: VideoPlayerProps) {
  const [videoData, setVideoData] = useState<{
    provider: "vimeo" | "youtube";
    videoId: string;
  } | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<import("plyr").default | null>(null);

  // Fetch video data from API
  useEffect(() => {
    setVideoData(null);
    setFetchError(false);

    let cancelled = false;
    async function fetchVideo() {
      try {
        const res = await fetch(
          `/api/video?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`
        );
        if (cancelled) return;
        if (!res.ok) {
          setFetchError(true);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setVideoData({ provider: data.provider, videoId: data.videoId });
      } catch {
        if (!cancelled) setFetchError(true);
      }
    }
    fetchVideo();

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  // Initialize Plyr when videoData is available
  useEffect(() => {
    if (!videoData || !containerRef.current) return;

    const container = containerRef.current;

    // Create the provider div that Plyr expects
    const wrapper = document.createElement("div");
    wrapper.className = "plyr__video-embed";
    wrapper.id = "plyr-target";

    const iframe = document.createElement("iframe");
    if (videoData.provider === "vimeo") {
      iframe.src = `https://player.vimeo.com/video/${videoData.videoId}?loop=false&byline=false&portrait=false&title=false&speed=true&transparent=0&gesture=media&dnt=1`;
    } else {
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoData.videoId}?origin=${window.location.origin}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
    }
    iframe.allow = "autoplay; fullscreen; picture-in-picture";

    wrapper.appendChild(iframe);
    container.appendChild(wrapper);

    // Dynamic import to avoid SSR issues
    let destroyed = false;
    import("plyr").then((PlyrModule) => {
      if (destroyed) {
        while (container.firstChild) container.firstChild.remove();
        return;
      }
      const Plyr = PlyrModule.default;
      const player = new Plyr("#plyr-target", {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "fullscreen",
        ],
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        invertTime: false,
        fullscreen: { iosNative: true },
      });
      plyrRef.current = player;
    });

    return () => {
      destroyed = true;
      // Directly remove the iframe to avoid Plyr calling YouTube's
      // stopVideo() which warns "player is not attached to the DOM"
      // during React unmount. Plyr.destroy() is intentionally skipped.
      plyrRef.current = null;
      while (container.firstChild) container.firstChild.remove();
    };
  }, [videoData]);

  // Error state
  if (fetchError) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-card flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Failed to load video.</p>
        <button
          onClick={() => {
            setFetchError(false);
            setVideoData(null);
            fetch(
              `/api/video?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`
            )
              .then((r) => r.json())
              .then((data) =>
                setVideoData({ provider: data.provider, videoId: data.videoId })
              )
              .catch(() => setFetchError(true));
          }}
          className="rounded-md bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading state
  if (!videoData) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-card flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="plyr-wrapper aspect-video w-full overflow-hidden rounded-lg"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
