import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { Eyebrow } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CourseCatalogPage() {
  const publishedCourses = await db.query.courses.findMany({
    where: eq(courses.isPublished, true),
    orderBy: desc(courses.createdAt),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Eyebrow>COURSES</Eyebrow>
      <h1 className="mt-2 mb-10 font-display text-3xl font-bold text-ink">
        コース一覧
      </h1>

      {publishedCourses.length === 0 ? (
        <p className="text-muted">現在公開中のコースはありません。</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {publishedCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group flex flex-col overflow-hidden rounded-sm border border-rule bg-paper-raised transition-shadow hover:shadow-[4px_4px_0_0_var(--rule)]"
            >
              <div className="aspect-video w-full overflow-hidden border-b border-rule bg-paper">
                {course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted">
                    NO IMAGE
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 p-5">
                <h2 className="font-display font-bold text-ink">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="line-clamp-2 text-sm text-ink-soft">
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
