import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { courses, sections, lessons } from "@/db/schema";
import { LinkButton, Eyebrow, IndexNumber } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await db.query.courses.findFirst({
    where: eq(courses.isPublished, true),
    orderBy: desc(courses.createdAt),
    with: {
      sections: {
        orderBy: sections.order,
        with: { lessons: { orderBy: lessons.order, columns: { id: true, title: true } } },
      },
    },
  });

  const previewLessons = featured
    ? featured.sections.flatMap((s) => s.lessons).slice(0, 5)
    : [];

  return (
    <div className="mx-auto grid max-w-5xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-28">
      <div className="flex flex-col items-start gap-6">
        <Eyebrow>ONLINE COURSE LEDGER</Eyebrow>
        <h1 className="font-display text-4xl leading-[1.3] font-bold text-ink lg:text-5xl">
          学びを、
          <br />
          一冊の台帳のように積み重ねる。
        </h1>
        <p className="max-w-md text-ink-soft">
          現役講師によるYouTube動画講座を、自分のペースで受講できます。レッスンをひとつ終えるたびに、台帳に済のしるしが刻まれていきます。
        </p>
        <LinkButton href="/courses" variant="primary" className="px-6 py-3">
          コース一覧を見る
        </LinkButton>
      </div>

      {featured && (
        <div className="rounded-sm border border-rule bg-paper-raised p-6 shadow-[3px_3px_0_0_var(--rule)]">
          <Eyebrow className="text-muted">目次 — {featured.title}</Eyebrow>
          <ul className="ruled-paper mt-4 flex flex-col">
            {previewLessons.map((lesson, i) => (
              <li
                key={lesson.id}
                className="flex items-baseline gap-3 py-[9px] text-sm"
              >
                <IndexNumber n={i + 1} />
                <span className="text-ink-soft">{lesson.title}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/courses/${featured.slug}`}
            className="mt-4 inline-block text-sm text-indigo hover:underline"
          >
            このコースを見る →
          </Link>
        </div>
      )}
    </div>
  );
}
