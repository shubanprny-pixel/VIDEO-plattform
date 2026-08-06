"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, user } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export async function grantEnrollment(courseId: string, formData: FormData) {
  const session = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) throw new Error("メールアドレスを入力してください");

  const targetUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  if (!targetUser) {
    throw new Error("指定のメールアドレスのユーザーが見つかりません");
  }

  await db
    .insert(enrollments)
    .values({
      userId: targetUser.id,
      courseId,
      status: "active",
      source: "manual",
      grantedByUserId: session.user.id,
    })
    .onConflictDoUpdate({
      target: [enrollments.userId, enrollments.courseId],
      set: {
        status: "active",
        source: "manual",
        grantedByUserId: session.user.id,
        grantedAt: new Date(),
        revokedAt: null,
      },
    });

  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}

export async function revokeEnrollment(
  enrollmentId: string,
  courseId: string,
) {
  await requireAdmin();
  await db
    .update(enrollments)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(
      and(eq(enrollments.id, enrollmentId), eq(enrollments.courseId, courseId)),
    );
  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}

export async function reactivateEnrollment(
  enrollmentId: string,
  courseId: string,
) {
  await requireAdmin();
  await db
    .update(enrollments)
    .set({ status: "active", revokedAt: null })
    .where(
      and(eq(enrollments.id, enrollmentId), eq(enrollments.courseId, courseId)),
    );
  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}
