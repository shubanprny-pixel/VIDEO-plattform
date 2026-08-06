"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress, comments } from "@/db/schema";
import { requireEnrollment } from "@/lib/access";
import { requireUser } from "@/lib/session";

export async function markLessonComplete(
  lessonId: string,
  courseId: string,
  courseSlug: string,
) {
  const session = await requireEnrollment(courseId);

  await db
    .insert(lessonProgress)
    .values({
      userId: session.user.id,
      lessonId,
      courseId,
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status: "completed", completedAt: new Date(), updatedAt: new Date() },
    });

  revalidatePath(`/learn/${encodeURIComponent(courseSlug)}`);
  revalidatePath("/dashboard");
}

export async function postComment(
  lessonId: string,
  courseId: string,
  courseSlug: string,
  parentCommentId: string | null,
  formData: FormData,
) {
  const session = await requireEnrollment(courseId);

  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("コメントを入力してください");

  await db.insert(comments).values({
    lessonId,
    userId: session.user.id,
    parentCommentId,
    body,
  });

  revalidatePath(`/learn/${encodeURIComponent(courseSlug)}/${lessonId}`);
}

export async function deleteComment(
  commentId: string,
  lessonId: string,
  courseSlug: string,
) {
  const session = await requireUser();

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    columns: { userId: true },
  });
  if (!comment) return;
  if (comment.userId !== session.user.id && session.user.role !== "admin") {
    throw new Error("このコメントを削除する権限がありません");
  }

  await db
    .update(comments)
    .set({ isDeleted: true, body: "" })
    .where(eq(comments.id, commentId));

  revalidatePath(`/learn/${encodeURIComponent(courseSlug)}/${lessonId}`);
}

export async function markLessonIncomplete(
  lessonId: string,
  courseId: string,
  courseSlug: string,
) {
  const session = await requireEnrollment(courseId);

  await db
    .insert(lessonProgress)
    .values({
      userId: session.user.id,
      lessonId,
      courseId,
      status: "not_started",
      completedAt: null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status: "not_started", completedAt: null, updatedAt: new Date() },
    });

  revalidatePath(`/learn/${encodeURIComponent(courseSlug)}`);
  revalidatePath("/dashboard");
}
