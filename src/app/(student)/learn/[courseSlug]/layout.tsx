import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { canAccessCourse } from "@/lib/access";
import { getCourseWithCurriculum } from "./data";
import { Eyebrow, IndexNumber, LinkButton, Stamp } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug: rawCourseSlug } = await params;
  const courseSlug = decodeURIComponent(rawCourseSlug);

  const session = await requireUser();
  const course = await getCourseWithCurriculum(courseSlug);
  if (!course) notFound();

  const allowed = await canAccessCourse(
    session.user.id,
    session.user.role,
    course.id,
  );
  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-xl font-bold text-ink">
          このコースを受講する権限がありません
        </h1>
        <p className="mt-2 text-sm text-muted">
          受講をご希望の方は講師にお問い合わせください。
        </p>
        <LinkButton href="/dashboard" variant="primary" className="mt-6">
          マイページへ戻る
        </LinkButton>
      </div>
    );
  }

  const completedRows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.courseId, course.id),
        eq(lessonProgress.status, "completed"),
      ),
    );
  const completedLessonIds = new Set(completedRows.map((r) => r.lessonId));
  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0,
  );

  const lessonIndexById = new Map<string, number>();
  let indexCounter = 0;
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      indexCounter += 1;
      lessonIndexById.set(lesson.id, indexCounter);
    }
  }

  return (
    <div className="flex flex-1">
      <aside className="w-72 shrink-0 border-r border-rule px-5 py-6">
        <Link href="/dashboard" className="font-mono text-xs text-muted hover:text-indigo">
          ← マイページ
        </Link>
        <h1 className="mt-3 font-display text-lg font-bold text-ink">
          {course.title}
        </h1>
        {totalLessons > 0 && (
          <Eyebrow className="mb-4 block">
            {completedLessonIds.size}/{totalLessons} 完了
          </Eyebrow>
        )}
        <nav className="mt-4 flex flex-col gap-5">
          {course.sections.map((section) => (
            <div key={section.id}>
              <p className="mb-1 font-mono text-xs text-muted">
                {section.title}
              </p>
              <ul className="flex flex-col">
                {section.lessons.map((lesson) => {
                  const done = completedLessonIds.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/learn/${encodeURIComponent(course.slug)}/${lesson.id}`}
                        className="flex items-center gap-2.5 rounded-sm px-1.5 py-1.5 text-sm text-ink-soft hover:bg-paper-raised hover:text-ink"
                      >
                        {done ? (
                          <Stamp />
                        ) : (
                          <IndexNumber
                            n={lessonIndexById.get(lesson.id) ?? 0}
                            className="w-6"
                          />
                        )}
                        {lesson.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
