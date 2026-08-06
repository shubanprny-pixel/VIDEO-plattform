import { createCourse } from "../actions";
import { Button, Eyebrow } from "@/components/ui";

const fieldClass =
  "rounded-sm border border-rule bg-paper-raised px-3 py-2 text-sm outline-none focus:border-indigo";

export default function NewCoursePage() {
  return (
    <div className="max-w-lg">
      <Eyebrow>NEW ENTRY</Eyebrow>
      <h1 className="mt-1 mb-6 font-display text-xl font-bold text-ink">
        新規コース作成
      </h1>
      <form action={createCourse} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          タイトル
          <input name="title" required className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          スラッグ (URL用、空欄ならタイトルから自動生成)
          <input name="slug" className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          説明
          <textarea name="description" rows={4} className={fieldClass} />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="isPublished" />
          公開する
        </label>
        <Button type="submit" variant="primary" className="self-start px-5 py-2">
          作成する
        </Button>
      </form>
    </div>
  );
}
