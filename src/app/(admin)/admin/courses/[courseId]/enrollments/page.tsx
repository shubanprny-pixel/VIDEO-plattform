import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button, Eyebrow, StatusBadge } from "@/components/ui";
import { grantEnrollment, revokeEnrollment, reactivateEnrollment } from "./actions";

export const dynamic = "force-dynamic";

const fieldClass =
  "rounded-sm border border-rule bg-paper-raised px-3 py-2 text-sm outline-none focus:border-indigo";

export default async function CourseEnrollmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  if (!course) notFound();

  const courseEnrollments = await db.query.enrollments.findMany({
    where: eq(enrollments.courseId, courseId),
    orderBy: desc(enrollments.grantedAt),
    with: { user: { columns: { id: true, name: true, email: true } } },
  });

  const boundGrant = grantEnrollment.bind(null, courseId);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <Link
          href={`/admin/courses/${courseId}`}
          className="font-mono text-xs text-muted hover:text-indigo"
        >
          ← コース編集に戻る
        </Link>
        <Eyebrow className="mt-3 block">ENROLLMENTS</Eyebrow>
        <h1 className="mt-1 font-display text-xl font-bold text-ink">
          受講権限管理: {course.title}
        </h1>
      </div>

      <form action={boundGrant} className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm text-ink-soft">
          メールアドレスで受講権限を付与
          <input
            type="email"
            name="email"
            required
            placeholder="student@example.com"
            className={fieldClass}
          />
        </label>
        <Button type="submit" variant="primary" className="px-4">
          付与する
        </Button>
      </form>

      {courseEnrollments.length === 0 ? (
        <p className="text-sm text-muted">
          まだ受講権限を付与されたユーザーはいません。
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-rule rounded-sm border border-rule bg-paper-raised">
          {courseEnrollments.map((enrollment) => {
            const boundRevoke = revokeEnrollment.bind(
              null,
              enrollment.id,
              courseId,
            );
            const boundReactivate = reactivateEnrollment.bind(
              null,
              enrollment.id,
              courseId,
            );
            return (
              <li
                key={enrollment.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{enrollment.user.name}</p>
                  <p className="text-muted">{enrollment.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    active={enrollment.status === "active"}
                    activeLabel="有効"
                    inactiveLabel="剥奪済み"
                  />
                  {enrollment.status === "active" ? (
                    <form action={boundRevoke}>
                      <ConfirmSubmitButton
                        message="このユーザーの受講権限を剥奪しますか？"
                        className="text-stamp hover:underline"
                      >
                        剥奪
                      </ConfirmSubmitButton>
                    </form>
                  ) : (
                    <form action={boundReactivate}>
                      <button type="submit" className="text-indigo hover:underline">
                        再付与
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
