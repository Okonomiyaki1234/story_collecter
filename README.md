
# 創作進捗＆あらすじ集

## 目的

自作創作の進捗状況やあらすじ、キャラクター情報などを一元管理・共有するアプリです。

---

## 記録したい情報

### 作品（story）
- タイトル
- あらすじ
- 本文（改行対応）
- 状況（例：企画段階／プロット段階／下書き中／執筆中／完成など）
- 開始時期（物語中の）
- 開始時期（リアルでの活動開始）

### キャラクター（character）
- キャラクター名
- 生年月日
- 利き手
- 血液型
- 家族構成（辞書型配列）
- プロフィール自由記述
- 性別

### 役割・関係性（role）
- 所属
- 年齢
- 身長
- 体重
- その時点の人間関係（辞書型配列）
- 作品紐づけ自由記述プロフィール
- 紐づく作品ID（story_id）
- 紐づくキャラクターID（character_id）

### ユーザープロファイル（profiles）
- Auth管理用（Supabase Auth）

---

## テーブル案

| テーブル名   | 主なカラム例・説明 |
|--------------|-------------------|
| profiles     | id, email, ...（Supabase Auth管理用） |
| story        | id, title, summary, body, status, start_in_story, start_in_real, created_at, updated_at |
| character    | id, name, birthday, handedness, blood_type, family (json), profile, gender |
| role         | id, story_id, character_id, affiliation, age, height, weight, relations (json), story_profile |

---

## 備考・提案
- 作品とキャラクターは多対多の関係なので、中間テーブルとしてroleを設ける設計は妥当です。
- "状況"や"性別"などはenum型で管理すると良いでしょう。
- "家族構成"や"人間関係"は柔軟性を持たせるためjson型（辞書型配列）で保存するのが便利です。
- 作品の本文は長文・改行対応のtext型推奨。
- 追加で記録したい要素があれば随時拡張可能な設計です。

---

## 今後の実装予定
- Supabase Authによるユーザー管理
- Supabase Databaseとの連携
- 編集・追加・削除機能
- 閲覧権限の管理

---

（このREADMEは設計メモとして随時更新してください）

---
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
