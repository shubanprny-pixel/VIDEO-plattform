import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function isEnrolled(userId: string, courseId: string) {
  const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);
  return Boolean(enrollment);
}

// Admins can access/manage any course (e.g. to answer student questions)
// without a separate enrollment row; students need an active enrollment.
export async function canAccessCourse(
  userId: string,
  role: string,
  courseId: string,
) {
  if (role === "admin") return true;
  return isEnrolled(userId, courseId);
}

// For use inside Server Actions/Route Handlers that mutate per-course data
// (progress, comments): never trust that the UI only calls this for an
// enrolled course — re-verify independently of whatever page rendered it.
export async function requireEnrollment(courseId: string) {
  const session = await requireUser();
  const allowed = await canAccessCourse(
    session.user.id,
    session.user.role,
    courseId,
  );
  if (!allowed) {
    throw new Error("このコースへの受講権限がありません");
  }
  return session;
}
