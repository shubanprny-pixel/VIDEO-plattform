import {
  sqliteTable,
  text,
  integer,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { lessons } from "./courses";

export const comments = sqliteTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentCommentId: text("parent_comment_id").references(
    (): AnySQLiteColumn => comments.id,
    { onDelete: "cascade" },
  ),
  body: text("body").notNull(),
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
