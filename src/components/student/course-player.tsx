"use client";

export function CoursePlayer({
  embedUrl,
  lessonId,
}: {
  embedUrl: string;
  lessonId: string;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded bg-black" data-lesson-id={lessonId}>
      <iframe
        key={lessonId}
        src={embedUrl}
        title="レッスン動画"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
