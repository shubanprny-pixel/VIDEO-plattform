import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  updateCourse,
  deleteCourse,
  createSection,
  updateSection,
  deleteSection,
  moveSection,
  createLesson,
  updateLesson,
  deleteLesson,
  moveLesson,
  uploadCourseThumbnail,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      sections: {
        orderBy: sections.order,
        with: {
          lessons: { orderBy: lessons.order },
        },
      },
    },
  });

  if (!course) notFound();

  const boundUpdateCourse = updateCourse.bind(null, courseId);
  const boundDeleteCourse = deleteCourse.bind(null, courseId);
  const boundCreateSection = createSection.bind(null, courseId);
  const boundUploadThumbnail = uploadCourseThumbnail.bind(null, courseId);

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">コース編集</h1>
        <form action={boundUpdateCourse} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            タイトル
            <input
              name="title"
              defaultValue={course.title}
              required
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            スラッグ
            <input
              name="slug"
              defaultValue={course.slug}
              required
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            説明
            <textarea
              name="description"
              defaultValue={course.description ?? ""}
              rows={4}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={course.isPublished}
            />
            公開する
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded bg-black px-3 py-2 text-sm text-white"
            >
              保存
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">サムネイル画像</p>
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt=""
              className="h-32 w-56 rounded border object-cover"
            />
          ) : (
            <div className="flex h-32 w-56 items-center justify-center rounded border border-dashed text-xs text-neutral-400">
              未設定
            </div>
          )}
          <form
            action={boundUploadThumbnail}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              name="thumbnail"
              accept="image/png,image/jpeg,image/webp"
              required
              className="text-sm"
            />
            <button
              type="submit"
              className="rounded border px-3 py-1.5 text-sm"
            >
              アップロード
            </button>
          </form>
        </div>

        <form action={boundDeleteCourse}>
          <ConfirmSubmitButton
            message="このコースを削除しますか？セクション・レッスン・受講データもすべて削除されます。"
            className="text-sm text-red-600 hover:underline"
          >
            このコースを削除する
          </ConfirmSubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">カリキュラム</h2>

        {course.sections.length === 0 && (
          <p className="text-sm text-neutral-500">
            まだセクションがありません。下のフォームから追加してください。
          </p>
        )}

        {course.sections.map((section, sectionIndex) => {
          const boundUpdateSection = updateSection.bind(
            null,
            section.id,
            courseId,
          );
          const boundDeleteSection = deleteSection.bind(
            null,
            section.id,
            courseId,
          );
          const boundMoveUp = moveSection.bind(
            null,
            section.id,
            courseId,
            "up",
          );
          const boundMoveDown = moveSection.bind(
            null,
            section.id,
            courseId,
            "down",
          );
          const boundCreateLesson = createLesson.bind(
            null,
            section.id,
            courseId,
          );

          return (
            <div key={section.id} className="rounded border p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <form action={boundMoveUp}>
                    <button
                      type="submit"
                      disabled={sectionIndex === 0}
                      className="px-1 text-neutral-500 disabled:opacity-30"
                    >
                      ▲
                    </button>
                  </form>
                  <form action={boundMoveDown}>
                    <button
                      type="submit"
                      disabled={sectionIndex === course.sections.length - 1}
                      className="px-1 text-neutral-500 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </form>
                </div>
                <form action={boundUpdateSection} className="flex flex-1 gap-2">
                  <input
                    name="title"
                    defaultValue={section.title}
                    className="flex-1 rounded border px-3 py-1.5 text-sm font-medium"
                  />
                  <button
                    type="submit"
                    className="rounded border px-3 py-1.5 text-sm"
                  >
                    保存
                  </button>
                </form>
                <form action={boundDeleteSection}>
                  <ConfirmSubmitButton
                    message="このセクションを削除しますか？中のレッスンもすべて削除されます。"
                    className="text-sm text-red-600 hover:underline"
                  >
                    削除
                  </ConfirmSubmitButton>
                </form>
              </div>

              <ul className="mt-4 flex flex-col gap-3 border-l pl-4">
                {section.lessons.map((lesson, lessonIndex) => {
                  const boundUpdateLesson = updateLesson.bind(
                    null,
                    lesson.id,
                    courseId,
                  );
                  const boundDeleteLesson = deleteLesson.bind(
                    null,
                    lesson.id,
                    courseId,
                  );
                  const boundLessonMoveUp = moveLesson.bind(
                    null,
                    lesson.id,
                    section.id,
                    courseId,
                    "up",
                  );
                  const boundLessonMoveDown = moveLesson.bind(
                    null,
                    lesson.id,
                    section.id,
                    courseId,
                    "down",
                  );

                  return (
                    <li key={lesson.id} className="rounded bg-neutral-50 p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col pt-1.5">
                          <form action={boundLessonMoveUp}>
                            <button
                              type="submit"
                              disabled={lessonIndex === 0}
                              className="px-1 text-xs text-neutral-500 disabled:opacity-30"
                            >
                              ▲
                            </button>
                          </form>
                          <form action={boundLessonMoveDown}>
                            <button
                              type="submit"
                              disabled={
                                lessonIndex === section.lessons.length - 1
                              }
                              className="px-1 text-xs text-neutral-500 disabled:opacity-30"
                            >
                              ▼
                            </button>
                          </form>
                        </div>
                        <form
                          action={boundUpdateLesson}
                          className="flex flex-1 flex-col gap-2"
                        >
                          <input
                            name="title"
                            defaultValue={lesson.title}
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="レッスン名"
                          />
                          <textarea
                            name="description"
                            defaultValue={lesson.description ?? ""}
                            rows={2}
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="説明(任意)"
                          />
                          <input
                            name="youtubeVideo"
                            defaultValue={lesson.youtubeVideoId}
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="YouTube URL または 動画ID"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              className="rounded border px-3 py-1 text-xs"
                            >
                              保存
                            </button>
                          </div>
                        </form>
                        <form action={boundDeleteLesson}>
                          <ConfirmSubmitButton
                            message="このレッスンを削除しますか？"
                            className="text-xs text-red-600 hover:underline"
                          >
                            削除
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <form
                action={boundCreateLesson}
                className="mt-4 flex flex-col gap-2 border-l pl-4"
              >
                <p className="text-xs font-medium text-neutral-500">
                  レッスンを追加
                </p>
                <input
                  name="title"
                  required
                  placeholder="レッスン名"
                  className="rounded border px-2 py-1 text-sm"
                />
                <textarea
                  name="description"
                  rows={2}
                  placeholder="説明(任意)"
                  className="rounded border px-2 py-1 text-sm"
                />
                <input
                  name="youtubeVideo"
                  required
                  placeholder="YouTube URL または 動画ID"
                  className="rounded border px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="self-start rounded border px-3 py-1 text-xs"
                >
                  追加
                </button>
              </form>
            </div>
          );
        })}

        <form
          action={boundCreateSection}
          className="flex items-end gap-2 rounded border border-dashed p-4"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm">
            新しいセクション名
            <input name="title" required className="rounded border px-3 py-2" />
          </label>
          <button
            type="submit"
            className="rounded bg-black px-3 py-2 text-sm text-white"
          >
            セクションを追加
          </button>
        </form>
      </section>
    </div>
  );
}
