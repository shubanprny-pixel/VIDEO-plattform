import Link from "next/link";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b px-6 py-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-semibold">
            動画講座プラットフォーム
          </Link>
          <Link href="/courses" className="text-neutral-600 hover:text-black">
            コース一覧
          </Link>
          <div className="ml-auto flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="hover:underline">
                  マイページ
                </Link>
                <LogoutButton className="hover:underline" />
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="rounded bg-black px-3 py-1.5 text-white"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
