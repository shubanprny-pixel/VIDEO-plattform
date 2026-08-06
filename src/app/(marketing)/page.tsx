import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-24">
      <h1 className="text-3xl font-bold">動画で学ぶ、実践的なオンライン講座</h1>
      <p className="text-neutral-600">
        現役講師によるYouTube動画講座を、自分のペースで学べます。
      </p>
      <Link
        href="/courses"
        className="rounded bg-black px-4 py-2 text-sm text-white"
      >
        コース一覧を見る
      </Link>
    </div>
  );
}
