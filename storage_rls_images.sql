
-- Supabase Storage バケット images 用 RLS設定例（storage.objects用）
-- バケット名: images

-- 既存ポリシーがあれば削除
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can write images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete images" ON storage.objects;

-- 読み取り（ダウンロード）は誰でも可能
CREATE POLICY "Public can read images" ON storage.objects
	FOR SELECT USING (bucket_id = 'images');

-- 書き込み（アップロード）は認証ユーザーのみ
CREATE POLICY "Authenticated can write images" ON storage.objects
	FOR INSERT WITH CHECK (
		bucket_id = 'images' AND auth.role() = 'authenticated'
	);

-- 更新も認証ユーザーのみ
CREATE POLICY "Authenticated can update images" ON storage.objects
	FOR UPDATE WITH CHECK (
		bucket_id = 'images' AND auth.role() = 'authenticated'
	);

-- 削除も認証ユーザーのみ
CREATE POLICY "Authenticated can delete images" ON storage.objects
	FOR DELETE USING (
		bucket_id = 'images' AND auth.role() = 'authenticated'
	);
