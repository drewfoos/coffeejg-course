"use client";

interface VideoPlayerProps {
  vimeoVideoId: string;
}

export function VideoPlayer({ vimeoVideoId }: VideoPlayerProps) {
  // During development, YouTube IDs are 11 chars; use YouTube embed
  const isYouTube = vimeoVideoId.length === 11;

  const src = isYouTube
    ? `https://www.youtube.com/embed/${vimeoVideoId}`
    : `https://player.vimeo.com/video/${vimeoVideoId}?dnt=1`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={src}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
