import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";
import { getSession } from "@/lib/session";
import { canAccessCourse } from "@/lib/access";
import { Eyebrow, IndexNumber, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug: rawCourseSlug } = await params;
  const courseSlug = decodeURIComponent(rawCourseSlug);

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, courseSlug), eq(courses.isPublished, true)),
    with: {
      sections: {
        orderBy: sections.order,
        with: {
          lessons: {
            orderBy: lessons.order,
            columns: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const session = await getSession();
  const enrolled = session
    ? await canAccessCourse(session.user.id, session.user.role, course.id)
    : false;

  const lessonCount = course.sections.reduce(
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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="aspect-video w-full overflow-hidden rounded-sm border border-rule bg-paper-raised">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted">
            NO IMAGE
          </div>
        )}
      </div>

      <Eyebrow className="mt-8">
        {course.sections.length}セクション・{lessonCount}レッスン
      </Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        {course.title}
      </h1>
      {course.description && (
        <p className="mt-3 whitespace-pre-wrap text-ink-soft">
          {course.description}
        </p>
      )}

      <div className="mt-8">
        {enrolled ? (
          <LinkButton href={`/learn/${course.slug}`} variant="primary" className="px-6 py-3">
            受講する
          </LinkButton>
        ) : session ? (
          <p className="rounded-sm border border-rule bg-paper-raised px-4 py-3 text-sm text-ink-soft">
            このコースはまだ受講登録されていません。受講をご希望の方は講師にお問い合わせください。
          </p>
        ) : (
          <LinkButton href="/login" variant="primary" className="px-6 py-3">
            ログインして確認する
          </LinkButton>
        )}
      </div>

      <div className="mt-14 flex flex-col gap-6">
        <h2 className="font-display text-xl font-bold text-ink">カリキュラム</h2>
        <div className="flex flex-col divide-y divide-rule rounded-sm border border-rule bg-paper-raised">
          {course.sections.map((section) => (
            <div key={section.id} className="px-5 py-4">
              <h3 className="font-medium text-ink">{section.title}</h3>
              <ul className="mt-2 flex flex-col">
                {section.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-baseline gap-3 py-1.5 text-sm text-ink-soft"
                  >
                    <IndexNumber n={lessonIndexById.get(lesson.id) ?? 0} />
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/courses"
        className="mt-10 inline-block text-sm text-muted hover:text-indigo hover:underline"
      >
        ← コース一覧に戻る
      </Link>
    </div>
  );
}
