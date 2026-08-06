import Link from "next/link";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const allCourses = await db.query.courses.findMany({
    orderBy: desc(courses.createdAt),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">コース一覧</h1>
        <Link
          href="/admin/courses/new"
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          新規コース作成
        </Link>
      </div>

      {allCourses.length === 0 ? (
        <p className="text-neutral-500">まだコースがありません。</p>
      ) : (
        <ul className="flex flex-col divide-y rounded border">
          {allCourses.map((course) => (
            <li key={course.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="font-medium hover:underline"
                >
                  {course.title}
                </Link>
                <p className="text-sm text-neutral-500">/{course.slug}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={
                    course.isPublished
                      ? "rounded bg-green-100 px-2 py-0.5 text-green-700"
                      : "rounded bg-neutral-100 px-2 py-0.5 text-neutral-600"
                  }
                >
                  {course.isPublished ? "公開中" : "下書き"}
                </span>
                <Link
                  href={`/admin/courses/${course.id}/enrollments`}
                  className="text-neutral-600 hover:underline"
                >
                  受講権限
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
