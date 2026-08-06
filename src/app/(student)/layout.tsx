import Link from "next/link";
import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { RoleSwitchTabs } from "@/components/role-switch-tabs";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const isAdmin = session.user.role === "admin";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rule px-6 py-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-display text-lg font-bold text-ink">
            動画講座プラットフォーム
          </Link>
          <Link href="/courses" className="text-ink-soft transition-colors hover:text-indigo">
            コース一覧
          </Link>
          <Link href="/dashboard" className="text-ink-soft transition-colors hover:text-indigo">
            マイページ
          </Link>
          {isAdmin && <RoleSwitchTabs active="student" />}
          <LogoutButton
            className={
              isAdmin
                ? "text-ink-soft transition-colors hover:text-indigo"
                : "ml-auto text-ink-soft transition-colors hover:text-indigo"
            }
          />
        </nav>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
