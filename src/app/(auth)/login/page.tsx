"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Eyebrow } from "@/components/ui";

const fieldClass =
  "border-b border-rule bg-transparent px-1 py-2 text-ink outline-none transition-colors focus:border-indigo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "ログインに失敗しました");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <Eyebrow>WELCOME BACK</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">ログイン</h1>
      </div>
      {error && (
        <p className="rounded-sm border border-stamp/30 bg-stamp/5 px-3 py-2 text-sm text-stamp">
          {error}
        </p>
      )}
      <Button type="button" variant="secondary" onClick={handleGoogleSignIn}>
        Googleでログイン
      </Button>
      <div className="flex items-center gap-3 font-mono text-xs text-muted">
        <div className="h-px flex-1 bg-rule" />
        または
        <div className="h-px flex-1 bg-rule" />
      </div>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        メールアドレス
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        パスワード
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </label>
      <Button type="submit" variant="primary" disabled={loading} className="mt-2 py-2.5">
        {loading ? "ログイン中..." : "ログイン"}
      </Button>
      <p className="text-sm text-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-indigo hover:underline">
          新規登録
        </Link>
      </p>
    </form>
  );
}
