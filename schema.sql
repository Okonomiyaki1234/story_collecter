-- Supabase用 テーブル定義例（PostgreSQL）

-- 作品テーブル
CREATE TABLE story (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  body text,
  status text, -- 例: enum化も可
  start_in_story text,
  start_in_real date,
  image_url text, -- 画像URL（storage連携用）
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);



-- キャラクターテーブル
CREATE TABLE character (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birthday date,
  handedness text,
  blood_type text,
  family jsonb,
  profile text,
  gender text,
  image_url text, -- 画像URL（storage連携用）
  updated_at timestamptz DEFAULT now()
);


-- 役割・関係性テーブル
CREATE TABLE role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES story(id) ON DELETE CASCADE,
  character_id uuid REFERENCES character(id) ON DELETE CASCADE,
  affiliation text,
  age integer,
  height numeric,
  weight numeric,
  relations jsonb,
  story_profile text,
  updated_at timestamptz DEFAULT now()
);

-- ユーザープロファイル（Supabase Authのprofiles例）

CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text,
  role text DEFAULT 'none',
  -- 他に必要なカラムがあれば追加
  created_at timestamptz DEFAULT now()
);



-- =============================
-- RLS（Row Level Security）とポリシー例
-- =============================

-- 1. RLS有効化
ALTER TABLE story ENABLE ROW LEVEL SECURITY;
ALTER TABLE character ENABLE ROW LEVEL SECURITY;
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. 閲覧（SELECT）は誰でも可能
CREATE POLICY "Public read access" ON story FOR SELECT USING (true);
CREATE POLICY "Public read access" ON character FOR SELECT USING (true);
CREATE POLICY "Public read access" ON role FOR SELECT USING (true);
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);

-- 3. 編集・追加・削除はprofiles.role = 'user' のみ許可
--   ※profilesテーブルにroleカラムを追加して管理する想定
--   auth.uid() = profiles.id で自分自身の判定
--   Supabaseのjwt()関数でroleを取得する場合はカスタムクレームが必要

-- 例: storyテーブル
CREATE POLICY "User can modify story" ON story
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'user'
    )
  );

-- 他テーブルも同様に設定
CREATE POLICY "User can modify character" ON character
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'user'
    )
  );

CREATE POLICY "User can modify role" ON role
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'user'
    )
  );

-- profilesテーブルは新規登録時のみ誰でもinsert可能
CREATE POLICY "Anyone can insert profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- 既存プロフィールの編集は自分のみ
CREATE POLICY "User can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- 必要に応じてDELETEや他の操作も追加してください

-- ※SupabaseのGUIでroleカラムをjwt()に含める設定が必要な場合があります
