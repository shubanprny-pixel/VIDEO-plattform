import Link from "next/link";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, sections, lessons, lessonProgress } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireUser();

  const myEnrollments = await db.query.enrollments.findMany({
    where: and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.status, "active"),
    ),
    orderBy: desc(enrollments.grantedAt),
    with: { course: true },
  });

  const courseIds = myEnrollments.map((e) => e.course.id);

  const totalLessonRows = courseIds.length
    ? await db
        .select({
          courseId: sections.courseId,
          count: sql<number>`count(*)`,
        })
        .from(lessons)
        .innerJoin(sections, eq(lessons.sectionId, sections.id))
        .where(inArray(sections.courseId, courseIds))
        .groupBy(sections.courseId)
    : [];
  const totalLessonsByCourse = new Map(
    totalLessonRows.map((r) => [r.courseId, Number(r.count)]),
  );

  const completedRows = courseIds.length
    ? await db
        .select({
          courseId: lessonProgress.courseId,
          count: sql<number>`count(*)`,
        })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, session.user.id),
            eq(lessonProgress.status, "completed"),
            inArray(lessonProgress.courseId, courseIds),
          ),
        )
        .groupBy(lessonProgress.courseId)
    : [];
  const completedByCourse = new Map(
    completedRows.map((r) => [r.courseId, Number(r.count)]),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold">マイページ</h1>

      {myEnrollments.length === 0 ? (
        <p className="text-neutral-500">
          まだ受講中のコースはありません。
          <Link href="/courses" className="ml-1 underline">
            コース一覧を見る
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {myEnrollments.map(({ course }) => {
            const total = totalLessonsByCourse.get(course.id) ?? 0;
            const completed = completedByCourse.get(course.id) ?? 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <li key={course.id} className="flex items-center gap-4 rounded border p-4">
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded bg-neutral-100">
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <h2 className="font-medium">{course.title}</h2>
                  {total > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-40 overflow-hidden rounded bg-neutral-100">
                        <div
                          className="h-full bg-black"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">
                        {completed}/{total}レッスン完了
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/learn/${encodeURIComponent(course.slug)}`}
                  className="rounded bg-black px-4 py-2 text-sm text-white"
                >
                  受講する
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
