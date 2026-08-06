import { notFound, redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getCourseWithCurriculum } from "./data";

export default async function LearnCourseIndexPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug: rawCourseSlug } = await params;
  const courseSlug = decodeURIComponent(rawCourseSlug);

  const session = await requireUser();
  const course = await getCourseWithCurriculum(courseSlug);
  if (!course) notFound();

  const firstLesson = course.sections[0]?.lessons[0];
  if (!firstLesson) {
    return (
      <p className="text-sm text-neutral-500">
        このコースにはまだレッスンがありません。
      </p>
    );
  }

  const lastProgress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.courseId, course.id),
    ),
    orderBy: desc(lessonProgress.updatedAt),
    columns: { lessonId: true },
  });

  const resumeLessonId = lastProgress?.lessonId ?? firstLesson.id;
  redirect(`/learn/${encodeURIComponent(course.slug)}/${resumeLessonId}`);
}
