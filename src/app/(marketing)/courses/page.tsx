import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function CourseCatalogPage() {
  const publishedCourses = await db.query.courses.findMany({
    where: eq(courses.isPublished, true),
    orderBy: desc(courses.createdAt),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold">コース一覧</h1>

      {publishedCourses.length === 0 ? (
        <p className="text-neutral-500">現在公開中のコースはありません。</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="flex flex-col overflow-hidden rounded border hover:shadow-sm"
            >
              <div className="aspect-video w-full bg-neutral-100">
                {course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-4">
                <h2 className="font-medium">{course.title}</h2>
                {course.description && (
                  <p className="line-clamp-2 text-sm text-neutral-500">
                    {course.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
