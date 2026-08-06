import Link from "next/link";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { LinkButton } from "@/components/ui";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rule px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center gap-8 text-sm">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-wide text-ink"
          >
            動画講座プラットフォーム
          </Link>
          <Link
            href="/courses"
            className="text-ink-soft transition-colors hover:text-indigo"
          >
            コース一覧
          </Link>
          <div className="ml-auto flex items-center gap-5">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-ink-soft transition-colors hover:text-indigo"
                >
                  マイページ
                </Link>
                <LogoutButton className="text-ink-soft transition-colors hover:text-indigo" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-ink-soft transition-colors hover:text-indigo"
                >
                  ログイン
                </Link>
                <LinkButton href="/signup" variant="primary">
                  新規登録
                </LinkButton>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
