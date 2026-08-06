import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";

export const getCourseWithCurriculum = cache(async (courseSlug: string) => {
  return db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      sections: {
        orderBy: sections.order,
        with: {
          lessons: { orderBy: lessons.order },
        },
      },
    },
  });
});

export type CourseWithCurriculum = NonNullable<
  Awaited<ReturnType<typeof getCourseWithCurriculum>>
>;
