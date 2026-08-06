import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";
import { getSession } from "@/lib/session";
import { canAccessCourse } from "@/lib/access";

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="aspect-video w-full overflow-hidden rounded bg-neutral-100">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            No Image
          </div>
        )}
      </div>

      <h1 className="mt-6 text-2xl font-bold">{course.title}</h1>
      {course.description && (
        <p className="mt-2 whitespace-pre-wrap text-neutral-600">
          {course.description}
        </p>
      )}
      <p className="mt-2 text-sm text-neutral-500">
        {course.sections.length}セクション・{lessonCount}レッスン
      </p>

      <div className="mt-6">
        {enrolled ? (
          <Link
            href={`/learn/${course.slug}`}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            受講する
          </Link>
        ) : session ? (
          <p className="rounded bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
            このコースはまだ受講登録されていません。受講をご希望の方は講師にお問い合わせください。
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded bg-black px-4 py-2 text-sm text-white"
            >
              ログインして確認する
            </Link>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">カリキュラム</h2>
        {course.sections.map((section) => (
          <div key={section.id} className="rounded border p-4">
            <h3 className="font-medium">{section.title}</h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
              {section.lessons.map((lesson) => (
                <li key={lesson.id}>・{lesson.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
