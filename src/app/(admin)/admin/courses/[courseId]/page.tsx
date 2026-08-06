import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button, Eyebrow, IndexNumber } from "@/components/ui";
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

const fieldClass =
  "rounded-sm border border-rule bg-paper-raised px-3 py-2 text-sm outline-none focus:border-indigo";
const smallFieldClass =
  "rounded-sm border border-rule bg-paper-raised px-2 py-1 text-sm outline-none focus:border-indigo";

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

  const lessonIndexById = new Map<string, number>();
  let indexCounter = 0;
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      indexCounter += 1;
      lessonIndexById.set(lesson.id, indexCounter);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section className="flex flex-col gap-4">
        <Eyebrow>EDIT</Eyebrow>
        <h1 className="-mt-2 font-display text-xl font-bold text-ink">
          コース編集
        </h1>
        <form action={boundUpdateCourse} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            タイトル
            <input
              name="title"
              defaultValue={course.title}
              required
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            スラッグ
            <input
              name="slug"
              defaultValue={course.slug}
              required
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            説明
            <textarea
              name="description"
              defaultValue={course.description ?? ""}
              rows={4}
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={course.isPublished}
            />
            公開する
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" className="px-5">
              保存
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-soft">サムネイル画像</p>
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt=""
              className="h-32 w-56 rounded-sm border border-rule object-cover"
            />
          ) : (
            <div className="flex h-32 w-56 items-center justify-center rounded-sm border border-dashed border-rule font-mono text-xs text-muted">
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
              className="text-sm text-ink-soft"
            />
            <Button type="submit" variant="secondary" className="px-3 py-1.5 text-sm">
              アップロード
            </Button>
          </form>
        </div>

        <form action={boundDeleteCourse}>
          <ConfirmSubmitButton
            message="このコースを削除しますか？セクション・レッスン・受講データもすべて削除されます。"
            className="font-mono text-sm text-stamp hover:underline"
          >
            このコースを削除する
          </ConfirmSubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <Eyebrow>CURRICULUM</Eyebrow>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">
            カリキュラム
          </h2>
        </div>

        {course.sections.length === 0 && (
          <p className="text-sm text-muted">
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
            <div key={section.id} className="rounded-sm border border-rule bg-paper-raised p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <form action={boundMoveUp}>
                    <button
                      type="submit"
                      disabled={sectionIndex === 0}
                      className="px-1 text-muted hover:text-indigo disabled:opacity-30"
                    >
                      ▲
                    </button>
                  </form>
                  <form action={boundMoveDown}>
                    <button
                      type="submit"
                      disabled={sectionIndex === course.sections.length - 1}
                      className="px-1 text-muted hover:text-indigo disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </form>
                </div>
                <form action={boundUpdateSection} className="flex flex-1 gap-2">
                  <input
                    name="title"
                    defaultValue={section.title}
                    className={`flex-1 font-medium ${smallFieldClass}`}
                  />
                  <Button type="submit" variant="secondary" className="px-3 py-1.5 text-sm">
                    保存
                  </Button>
                </form>
                <form action={boundDeleteSection}>
                  <ConfirmSubmitButton
                    message="このセクションを削除しますか？中のレッスンもすべて削除されます。"
                    className="font-mono text-sm text-stamp hover:underline"
                  >
                    削除
                  </ConfirmSubmitButton>
                </form>
              </div>

              <ul className="mt-4 flex flex-col gap-3 border-l border-rule pl-4">
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
                    <li key={lesson.id} className="rounded-sm bg-paper p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col pt-1.5">
                          <form action={boundLessonMoveUp}>
                            <button
                              type="submit"
                              disabled={lessonIndex === 0}
                              className="px-1 text-xs text-muted hover:text-indigo disabled:opacity-30"
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
                              className="px-1 text-xs text-muted hover:text-indigo disabled:opacity-30"
                            >
                              ▼
                            </button>
                          </form>
                        </div>
                        <IndexNumber n={lessonIndexById.get(lesson.id) ?? 0} className="pt-2" />
                        <form
                          action={boundUpdateLesson}
                          className="flex flex-1 flex-col gap-2"
                        >
                          <input
                            name="title"
                            defaultValue={lesson.title}
                            className={smallFieldClass}
                            placeholder="レッスン名"
                          />
                          <textarea
                            name="description"
                            defaultValue={lesson.description ?? ""}
                            rows={2}
                            className={smallFieldClass}
                            placeholder="説明(任意)"
                          />
                          <input
                            name="youtubeVideo"
                            defaultValue={lesson.youtubeVideoId}
                            className={`font-mono ${smallFieldClass}`}
                            placeholder="YouTube URL または 動画ID"
                          />
                          <div className="flex items-center gap-3">
                            <Button type="submit" variant="secondary" className="px-3 py-1 text-xs">
                              保存
                            </Button>
                          </div>
                        </form>
                        <form action={boundDeleteLesson}>
                          <ConfirmSubmitButton
                            message="このレッスンを削除しますか？"
                            className="font-mono text-xs text-stamp hover:underline"
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
                className="mt-4 flex flex-col gap-2 border-l border-rule pl-4"
              >
                <p className="font-mono text-xs text-muted">
                  レッスンを追加
                </p>
                <input
                  name="title"
                  required
                  placeholder="レッスン名"
                  className={smallFieldClass}
                />
                <textarea
                  name="description"
                  rows={2}
                  placeholder="説明(任意)"
                  className={smallFieldClass}
                />
                <input
                  name="youtubeVideo"
                  required
                  placeholder="YouTube URL または 動画ID"
                  className={`font-mono ${smallFieldClass}`}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="self-start px-3 py-1 text-xs"
                >
                  追加
                </Button>
              </form>
            </div>
          );
        })}

        <form
          action={boundCreateSection}
          className="flex items-end gap-2 rounded-sm border border-dashed border-rule p-4"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink-soft">
            新しいセクション名
            <input name="title" required className={fieldClass} />
          </label>
          <Button type="submit" variant="primary" className="px-5">
            セクションを追加
          </Button>
        </form>
      </section>
    </div>
  );
}
