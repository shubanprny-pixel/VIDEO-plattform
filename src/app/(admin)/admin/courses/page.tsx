import Link from "next/link";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Eyebrow, LinkButton, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const allCourses = await db.query.courses.findMany({
    orderBy: desc(courses.createdAt),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>ADMIN</Eyebrow>
          <h1 className="mt-1 font-display text-xl font-bold text-ink">
            コース一覧
          </h1>
        </div>
        <LinkButton href="/admin/courses/new" variant="primary">
          新規コース作成
        </LinkButton>
      </div>

      {allCourses.length === 0 ? (
        <p className="text-muted">まだコースがありません。</p>
      ) : (
        <ul className="flex flex-col divide-y divide-rule rounded-sm border border-rule bg-paper-raised">
          {allCourses.map((course) => (
            <li key={course.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="font-medium text-ink hover:text-indigo hover:underline"
                >
                  {course.title}
                </Link>
                <p className="font-mono text-xs text-muted">/{course.slug}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <StatusBadge
                  active={course.isPublished}
                  activeLabel="公開中"
                  inactiveLabel="下書き"
                />
                <Link
                  href={`/admin/courses/${course.id}/enrollments`}
                  className="text-ink-soft hover:text-indigo hover:underline"
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
