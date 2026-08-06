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
      <header className="border-b px-6 py-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-semibold">
            動画講座プラットフォーム
          </Link>
          <Link href="/courses" className="text-neutral-600 hover:text-black">
            コース一覧
          </Link>
          <Link href="/dashboard" className="text-neutral-600 hover:text-black">
            マイページ
          </Link>
          {isAdmin && <RoleSwitchTabs active="student" />}
          <LogoutButton
            className={
              isAdmin
                ? "text-neutral-600 hover:underline"
                : "ml-auto text-neutral-600 hover:underline"
            }
          />
        </nav>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
