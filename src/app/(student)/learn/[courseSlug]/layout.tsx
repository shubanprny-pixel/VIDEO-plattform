import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { canAccessCourse } from "@/lib/access";
import { getCourseWithCurriculum } from "./data";

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
        <h1 className="text-lg font-semibold">このコースを受講する権限がありません</h1>
        <p className="mt-2 text-sm text-neutral-600">
          受講をご希望の方は講師にお問い合わせください。
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded bg-black px-4 py-2 text-sm text-white"
        >
          マイページへ戻る
        </Link>
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

  return (
    <div className="flex flex-1">
      <aside className="w-72 shrink-0 border-r px-4 py-6">
        <Link href="/dashboard" className="text-xs text-neutral-500 hover:underline">
          ← マイページ
        </Link>
        <h1 className="mt-2 font-semibold">{course.title}</h1>
        {totalLessons > 0 && (
          <p className="mb-4 text-xs text-neutral-500">
            {completedLessonIds.size}/{totalLessons}レッスン完了
          </p>
        )}
        <nav className="mt-4 flex flex-col gap-4">
          {course.sections.map((section) => (
            <div key={section.id}>
              <p className="mb-1 text-xs font-medium text-neutral-500">
                {section.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${encodeURIComponent(course.slug)}/${lesson.id}`}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <span
                        className={
                          completedLessonIds.has(lesson.id)
                            ? "text-green-600"
                            : "text-neutral-300"
                        }
                      >
                        ✓
                      </span>
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
