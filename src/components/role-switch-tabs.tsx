import Link from "next/link";

export function RoleSwitchTabs({ active }: { active: "admin" | "student" }) {
  return (
    <div className="ml-auto flex items-center gap-0.5 rounded-sm border border-rule p-0.5 font-mono text-xs">
      <Link
        href="/admin/courses"
        className={
          active === "admin"
            ? "rounded-sm bg-indigo px-3 py-1 text-paper"
            : "rounded-sm px-3 py-1 text-ink-soft hover:text-indigo"
        }
      >
        管理者画面
      </Link>
      <Link
        href="/dashboard"
        className={
          active === "student"
            ? "rounded-sm bg-indigo px-3 py-1 text-paper"
            : "rounded-sm px-3 py-1 text-ink-soft hover:text-indigo"
        }
      >
        受講者画面
      </Link>
    </div>
  );
}
