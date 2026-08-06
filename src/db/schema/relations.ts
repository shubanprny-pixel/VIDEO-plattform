import { relations } from "drizzle-orm";
import { user } from "./auth";
import { courses, sections, lessons } from "./courses";
import { enrollments } from "./enrollments";
import { lessonProgress } from "./progress";
import { comments } from "./comments";

export const coursesRelations = relations(courses, ({ many }) => ({
  sections: many(sections),
  enrollments: many(enrollments),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, {
    fields: [lessons.sectionId],
    references: [sections.id],
  }),
  comments: many(comments),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(user, { fields: [enrollments.userId], references: [user.id] }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  grantedBy: one(user, {
    fields: [enrollments.grantedByUserId],
    references: [user.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(user, { fields: [lessonProgress.userId], references: [user.id] }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  course: one(courses, {
    fields: [lessonProgress.courseId],
    references: [courses.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [comments.lessonId],
    references: [lessons.id],
  }),
  user: one(user, { fields: [comments.userId], references: [user.id] }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, { relationName: "commentReplies" }),
}));
