"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { validateThumbnailFile } from "@/lib/blob";

const courseSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください"),
  slug: z.string().trim().min(1, "スラッグを入力してください"),
  description: z.string().trim().optional(),
  isPublished: z.boolean(),
});

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const parsed = courseSchema.safeParse({
    title,
    slug: String(formData.get("slug") ?? "") || slugify(title),
    description: String(formData.get("description") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "入力内容が不正です");
  }

  const [course] = await db
    .insert(courses)
    .values({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      isPublished: parsed.data.isPublished,
    })
    .returning({ id: courses.id });

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const parsed = courseSchema.safeParse({
    title,
    slug: String(formData.get("slug") ?? "") || slugify(title),
    description: String(formData.get("description") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "入力内容が不正です");
  }

  await db
    .update(courses)
    .set({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      isPublished: parsed.data.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  await db.delete(courses).where(eq(courses.id, courseId));
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function createSection(courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("セクション名を入力してください");

  const [{ maxOrder } = { maxOrder: 0 }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${sections.order}), 0)` })
    .from(sections)
    .where(eq(sections.courseId, courseId));

  await db.insert(sections).values({
    courseId,
    title,
    order: maxOrder + 1,
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateSection(
  sectionId: string,
  courseId: string,
  formData: FormData,
) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("セクション名を入力してください");
  await db.update(sections).set({ title }).where(eq(sections.id, sectionId));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteSection(sectionId: string, courseId: string) {
  await requireAdmin();
  await db.delete(sections).where(eq(sections.id, sectionId));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function moveSection(
  sectionId: string,
  courseId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const rows = await db
    .select({ id: sections.id, order: sections.order })
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(sections.order);

  const index = rows.findIndex((r) => r.id === sectionId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;

  const current = rows[index];
  const target = rows[targetIndex];
  await db
    .update(sections)
    .set({ order: target.order })
    .where(eq(sections.id, current.id));
  await db
    .update(sections)
    .set({ order: current.order })
    .where(eq(sections.id, target.id));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLesson(
  sectionId: string,
  courseId: string,
  formData: FormData,
) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const videoInput = String(formData.get("youtubeVideo") ?? "").trim();
  if (!title) throw new Error("レッスン名を入力してください");
  const youtubeVideoId = extractYoutubeVideoId(videoInput);
  if (!youtubeVideoId) {
    throw new Error("YouTube動画のURLまたはIDが正しくありません");
  }

  const [{ maxOrder } = { maxOrder: 0 }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${lessons.order}), 0)` })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));

  await db.insert(lessons).values({
    sectionId,
    title,
    description: description || null,
    youtubeVideoId,
    order: maxOrder + 1,
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  formData: FormData,
) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const videoInput = String(formData.get("youtubeVideo") ?? "").trim();
  if (!title) throw new Error("レッスン名を入力してください");
  const youtubeVideoId = extractYoutubeVideoId(videoInput);
  if (!youtubeVideoId) {
    throw new Error("YouTube動画のURLまたはIDが正しくありません");
  }

  await db
    .update(lessons)
    .set({ title, description: description || null, youtubeVideoId })
    .where(eq(lessons.id, lessonId));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await requireAdmin();
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function moveLesson(
  lessonId: string,
  sectionId: string,
  courseId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const rows = await db
    .select({ id: lessons.id, order: lessons.order })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId))
    .orderBy(lessons.order);

  const index = rows.findIndex((r) => r.id === lessonId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;

  const current = rows[index];
  const target = rows[targetIndex];
  await db
    .update(lessons)
    .set({ order: target.order })
    .where(eq(lessons.id, current.id));
  await db
    .update(lessons)
    .set({ order: current.order })
    .where(eq(lessons.id, target.id));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function uploadCourseThumbnail(
  courseId: string,
  formData: FormData,
) {
  await requireAdmin();

  const file = formData.get("thumbnail");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("画像ファイルを選択してください");
  }
  validateThumbnailFile(file);

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { thumbnailBlobPath: true },
  });

  const blob = await put(`course-thumbnails/${courseId}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await db
    .update(courses)
    .set({
      thumbnailUrl: blob.url,
      thumbnailBlobPath: blob.pathname,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));

  if (course?.thumbnailBlobPath) {
    await del(course.thumbnailBlobPath).catch(() => {
      // old blob already gone or unreachable; not fatal
    });
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}
