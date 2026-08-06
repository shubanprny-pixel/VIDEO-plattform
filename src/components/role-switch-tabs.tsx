import Link from "next/link";

export function RoleSwitchTabs({ active }: { active: "admin" | "student" }) {
  return (
    <div className="ml-auto flex items-center gap-0.5 rounded-full border p-0.5 text-xs">
      <Link
        href="/admin/courses"
        className={
          active === "admin"
            ? "rounded-full bg-black px-3 py-1 text-white"
            : "rounded-full px-3 py-1 text-neutral-600 hover:text-black"
        }
      >
        管理者画面
      </Link>
      <Link
        href="/dashboard"
        className={
          active === "student"
            ? "rounded-full bg-black px-3 py-1 text-white"
            : "rounded-full px-3 py-1 text-neutral-600 hover:text-black"
        }
      >
        受講者画面
      </Link>
    </div>
  );
}
