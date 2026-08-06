import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { RoleSwitchTabs } from "@/components/role-switch-tabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rule px-6 py-4">
        <nav className="flex items-center gap-6 text-sm">
          <span className="font-display font-bold text-ink">管理画面</span>
          <Link
            href="/admin/courses"
            className="text-ink-soft transition-colors hover:text-indigo"
          >
            コース一覧
          </Link>
          <RoleSwitchTabs active="admin" />
        </nav>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
