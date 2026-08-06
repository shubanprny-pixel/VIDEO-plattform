import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { grantEnrollment, revokeEnrollment, reactivateEnrollment } from "./actions";

export const dynamic = "force-dynamic";

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
          className="text-sm text-neutral-500 hover:underline"
        >
          ← コース編集に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          受講権限管理: {course.title}
        </h1>
      </div>

      <form action={boundGrant} className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          メールアドレスで受講権限を付与
          <input
            type="email"
            name="email"
            required
            placeholder="student@example.com"
            className="rounded border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          付与する
        </button>
      </form>

      {courseEnrollments.length === 0 ? (
        <p className="text-sm text-neutral-500">
          まだ受講権限を付与されたユーザーはいません。
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded border">
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
                  <p className="font-medium">{enrollment.user.name}</p>
                  <p className="text-neutral-500">{enrollment.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      enrollment.status === "active"
                        ? "rounded bg-green-100 px-2 py-0.5 text-green-700"
                        : "rounded bg-neutral-100 px-2 py-0.5 text-neutral-500"
                    }
                  >
                    {enrollment.status === "active" ? "有効" : "剥奪済み"}
                  </span>
                  {enrollment.status === "active" ? (
                    <form action={boundRevoke}>
                      <ConfirmSubmitButton
                        message="このユーザーの受講権限を剥奪しますか？"
                        className="text-red-600 hover:underline"
                      >
                        剥奪
                      </ConfirmSubmitButton>
                    </form>
                  ) : (
                    <form action={boundReactivate}>
                      <button type="submit" className="text-neutral-700 hover:underline">
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
