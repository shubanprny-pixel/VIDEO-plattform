# 動画講座プラットフォーム MVP タスク状況

プランファイル: `C:\Users\banpo\.claude\plans\inherited-sparking-minsky.md`

| # | マイルストーン | 状態 |
|---|---|---|
| 1 | create-next-app + git init + .env.example | 完了 |
| 2 | Turso/Drizzle接続確認 | 完了 |
| 3 | better-auth導入（email/password, role） | 完了 |
| 4 | admin化 + requireAdmin/requireUser + proxy.ts | 完了 |
| 5 | courses/sections/lessons スキーマ + 管理画面CRUD | 完了 |
| 6 | Vercel Blob連携（サムネイルアップロード） | 完了（実トークン未接続のためローカルではuploadパス未検証） |
| 7 | 公開カタログページ | 完了 |
| 8 | 管理画面: 受講権限の手動付与・剥奪UI | 完了 |
| 9 | 受講生ダッシュボード + 認可付きレッスン視聴ページ | 完了 |
| 10 | 視聴進捗トラッキング（完了ボタン） + 進捗%表示・続きから再生 | 完了 |
| 11 | コメント/質問機能（1階層スレッド、論理削除） | 完了（管理者は未受講コースでも閲覧・返信可能な拡張込み） |
| 12 | 空状態・エラーページ・バリデーション(zod) | 主要フローは対応済み。専用403/404ページは未整備 |
| 13 | Vercelへデプロイ | 未着手（Turso本番DB作成・Vercelプロジェクト作成・Blobストア接続がユーザー側作業として必要） |

## 未着手・MVP範囲外（プラン記載通り）
- Stripe決済連携
- メール通知
- YouTube Data APIによる自動メタデータ取得

## 既知の制限
- Vercel Blobアップロードは`BLOB_READ_WRITE_TOKEN`未設定のためローカルでは未検証
- ローカルDBは `file:local.db`（Tursoリモート未接続）
