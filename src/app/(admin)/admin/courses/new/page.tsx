import { createCourse } from "../actions";

export default function NewCoursePage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">新規コース作成</h1>
      <form action={createCourse} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          タイトル
          <input
            name="title"
            required
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          スラッグ (URL用、空欄ならタイトルから自動生成)
          <input name="slug" className="rounded border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          説明
          <textarea
            name="description"
            rows={4}
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" />
          公開する
        </label>
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white"
        >
          作成する
        </button>
      </form>
    </div>
  );
}
