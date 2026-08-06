import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { courses } from "./courses";

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["active", "revoked"] })
      .notNull()
      .default("active"),
    source: text("source", { enum: ["manual", "stripe"] })
      .notNull()
      .default("manual"),
    grantedByUserId: text("granted_by_user_id").references(() => user.id),
    stripeCustomerId: text("stripe_customer_id"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    grantedAt: integer("granted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
  },
  (t) => [uniqueIndex("enrollments_user_course_idx").on(t.userId, t.courseId)],
);
