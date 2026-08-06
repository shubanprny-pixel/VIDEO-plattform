import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, lessonProgress, comments } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { canAccessCourse } from "@/lib/access";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { CoursePlayer } from "@/components/student/course-player";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button, Eyebrow, Stamp } from "@/components/ui";
import {
  markLessonComplete,
  markLessonIncomplete,
  postComment,
  deleteComment,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug: rawCourseSlug, lessonId } = await params;
  const courseSlug = decodeURIComponent(rawCourseSlug);

  // 1. Authenticate.
  const session = await requireUser();

  // 2. Resolve the course by slug and verify enrollment BEFORE touching
  //    the lessons table at all — an unauthorized visitor's request must
  //    never cause the video ID to be read from the database.
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    columns: { id: true, slug: true, title: true },
  });
  if (!course) notFound();

  const allowed = await canAccessCourse(
    session.user.id,
    session.user.role,
    course.id,
  );
  if (!allowed) {
    return (
      <p className="text-sm text-muted">
        このコースを受講する権限がありません。
      </p>
    );
  }

  // 3. Only now is it safe to load the lesson (and its YouTube video ID).
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      section: { columns: { courseId: true } },
    },
  });

  if (!lesson || lesson.section.courseId !== course.id) notFound();

  const progress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.lessonId, lesson.id),
    ),
    columns: { status: true },
  });
  const isCompleted = progress?.status === "completed";

  const boundMarkComplete = markLessonComplete.bind(
    null,
    lesson.id,
    course.id,
    course.slug,
  );
  const boundMarkIncomplete = markLessonIncomplete.bind(
    null,
    lesson.id,
    course.id,
    course.slug,
  );

  const lessonComments = await db.query.comments.findMany({
    where: eq(comments.lessonId, lesson.id),
    orderBy: comments.createdAt,
    with: { user: { columns: { id: true, name: true, role: true } } },
  });
  const topLevelComments = lessonComments.filter((c) => !c.parentCommentId);
  const repliesByParentId = new Map<string, typeof lessonComments>();
  for (const c of lessonComments) {
    if (!c.parentCommentId) continue;
    const list = repliesByParentId.get(c.parentCommentId) ?? [];
    list.push(c);
    repliesByParentId.set(c.parentCommentId, list);
  }

  const boundPostTopLevel = postComment.bind(
    null,
    lesson.id,
    course.id,
    course.slug,
    null,
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">
            {lesson.description}
          </p>
        )}
      </div>

      <CoursePlayer
        embedUrl={youtubeEmbedUrl(lesson.youtubeVideoId)}
        lessonId={lesson.id}
      />

      <div className="flex items-center gap-4">
        {isCompleted ? (
          <form action={boundMarkIncomplete} className="flex items-center gap-2">
            <Stamp size="md" />
            <button
              type="submit"
              className="font-mono text-xs text-muted hover:text-indigo hover:underline"
            >
              完了済み（取り消す）
            </button>
          </form>
        ) : (
          <form action={boundMarkComplete}>
            <Button type="submit" variant="primary">
              このレッスンを完了にする
            </Button>
          </form>
        )}
      </div>

      <section className="flex flex-col gap-4 border-t border-rule pt-6">
        <Eyebrow>Q&amp;A</Eyebrow>
        <h2 className="-mt-2 font-display font-bold text-ink">コメント・質問</h2>

        <form action={boundPostTopLevel} className="flex flex-col gap-2">
          <textarea
            name="body"
            required
            rows={3}
            placeholder="質問やコメントを入力"
            className="rounded-sm border border-rule bg-paper-raised px-3 py-2 text-sm outline-none focus:border-indigo"
          />
          <Button type="submit" variant="primary" className="self-start px-4 py-1.5">
            投稿する
          </Button>
        </form>

        {topLevelComments.length === 0 ? (
          <p className="text-sm text-muted">まだコメントはありません。</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {topLevelComments.map((comment) => {
              const boundReply = postComment.bind(
                null,
                lesson.id,
                course.id,
                course.slug,
                comment.id,
              );
              const boundDelete = deleteComment.bind(
                null,
                comment.id,
                lesson.id,
                course.slug,
              );
              const canDelete =
                !comment.isDeleted &&
                (comment.userId === session.user.id ||
                  session.user.role === "admin");
              const replies = repliesByParentId.get(comment.id) ?? [];

              return (
                <li key={comment.id} className="flex flex-col gap-2">
                  <CommentBody
                    name={comment.user.name}
                    isAdmin={comment.user.role === "admin"}
                    createdAt={comment.createdAt}
                    body={comment.body}
                    isDeleted={comment.isDeleted}
                  />
                  {canDelete && (
                    <form action={boundDelete}>
                      <ConfirmSubmitButton
                        message="このコメントを削除しますか？"
                        className="self-start font-mono text-xs text-stamp hover:underline"
                      >
                        削除
                      </ConfirmSubmitButton>
                    </form>
                  )}

                  {replies.length > 0 && (
                    <ul className="ml-6 flex flex-col gap-3 border-l border-rule pl-4">
                      {replies.map((reply) => {
                        const boundDeleteReply = deleteComment.bind(
                          null,
                          reply.id,
                          lesson.id,
                          course.slug,
                        );
                        const canDeleteReply =
                          !reply.isDeleted &&
                          (reply.userId === session.user.id ||
                            session.user.role === "admin");
                        return (
                          <li key={reply.id} className="flex flex-col gap-2">
                            <CommentBody
                              name={reply.user.name}
                              isAdmin={reply.user.role === "admin"}
                              createdAt={reply.createdAt}
                              body={reply.body}
                              isDeleted={reply.isDeleted}
                            />
                            {canDeleteReply && (
                              <form action={boundDeleteReply}>
                                <ConfirmSubmitButton
                                  message="このコメントを削除しますか？"
                                  className="self-start font-mono text-xs text-stamp hover:underline"
                                >
                                  削除
                                </ConfirmSubmitButton>
                              </form>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <form action={boundReply} className="ml-6 flex flex-col gap-2">
                    <textarea
                      name="body"
                      required
                      rows={2}
                      placeholder="返信する"
                      className="rounded-sm border border-rule bg-paper-raised px-3 py-1.5 text-sm outline-none focus:border-indigo"
                    />
                    <Button type="submit" variant="secondary" className="self-start px-3 py-1 text-xs">
                      返信を投稿
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link
        href={`/learn/${encodeURIComponent(course.slug)}`}
        className="text-sm text-muted hover:text-indigo hover:underline"
      >
        コース一覧に戻る
      </Link>
    </div>
  );
}

function CommentBody({
  name,
  isAdmin,
  createdAt,
  body,
  isDeleted,
}: {
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  body: string;
  isDeleted: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-xs text-muted">
        <span className="font-medium text-ink-soft">{name}</span>
        {isAdmin && (
          <span className="rounded-sm bg-indigo px-1.5 py-0.5 text-paper">
            講師
          </span>
        )}
        <span>{createdAt.toLocaleString("ja-JP")}</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm">
        {isDeleted ? (
          <span className="text-muted">このコメントは削除されました</span>
        ) : (
          body
        )}
      </p>
    </div>
  );
}
