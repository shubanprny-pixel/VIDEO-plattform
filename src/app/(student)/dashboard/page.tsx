import Link from "next/link";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, sections, lessons, lessonProgress } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { Eyebrow, LinkButton, Stamp } from "@/components/ui";

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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow>MY LEDGER</Eyebrow>
      <h1 className="mt-2 mb-10 font-display text-2xl font-bold text-ink">
        マイページ
      </h1>

      {myEnrollments.length === 0 ? (
        <p className="text-muted">
          まだ受講中のコースはありません。
          <Link href="/courses" className="ml-1 text-indigo hover:underline">
            コース一覧を見る
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-rule rounded-sm border border-rule bg-paper-raised">
          {myEnrollments.map(({ course }) => {
            const total = totalLessonsByCourse.get(course.id) ?? 0;
            const completed = completedByCourse.get(course.id) ?? 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isComplete = total > 0 && completed === total;
            return (
              <li key={course.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-sm border border-rule bg-paper">
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
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-ink">{course.title}</h2>
                    {isComplete && <Stamp />}
                  </div>
                  {total > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 w-40 overflow-hidden rounded-sm bg-rule/60">
                        <div
                          className="h-full bg-indigo"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-muted">
                        {completed}/{total}
                      </span>
                    </div>
                  )}
                </div>
                <LinkButton
                  href={`/learn/${encodeURIComponent(course.slug)}`}
                  variant="primary"
                >
                  受講する
                </LinkButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
