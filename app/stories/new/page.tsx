"use client";
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { supabase } from '../../../lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StoryNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    summary: '',
    body: '',
    status: '',
    statusOther: '',
    start_in_story: '',
    start_in_real: '',
    image: null as File | null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 入力変更
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 画像アップロード
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    let image_url: string | null = null;
    try {
      // 画像アップロード
      if (form.image) {
        const fileExt = form.image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { data: imgData, error: imgErr } = await supabase.storage
          .from('images')
          .upload(fileName, form.image);
        if (imgErr) throw imgErr;
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
        image_url = urlData?.publicUrl || null;
      }
      // 状況
      let status = form.status === 'その他' ? form.statusOther : form.status;
      // DB登録
      const { data, error: dbErr } = await supabase
        .from('story')
        .insert([
          {
            title: form.title,
            summary: form.summary,
            body: form.body,
            status,
            start_in_story: form.start_in_story,
            start_in_real: form.start_in_real || null,
            image_url,
          },
        ])
        .select('id')
        .single();
      if (dbErr) throw dbErr;
      router.push(`/stories/${data.id}`);
    } catch (err: any) {
      setError(err.message || '登録に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
      <Header />
      <div className="mt-8" />
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">ストーリー新規作成</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">タイトル<span className="text-red-500">*</span></label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">あらすじ</label>
            <textarea
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.summary}
              onChange={e => handleChange('summary', e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">本文</label>
            <textarea
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.body}
              onChange={e => handleChange('body', e.target.value)}
              rows={6}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">状況</label>
            <select
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.status}
              onChange={e => handleChange('status', e.target.value)}
              required
            >
              <option value="">選択してください</option>
              <option value="完成">完成</option>
              <option value="執筆中">執筆中</option>
              <option value="停滞中">停滞中</option>
              <option value="下書き">下書き</option>
              <option value="下書き中">下書き中</option>
              <option value="プロット構想">プロット構想</option>
              <option value="アイデアだけ">アイデアだけ</option>
              <option value="その他">その他（入力）</option>
            </select>
            {form.status === 'その他' && (
              <input
                className="mt-2 w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
                value={form.statusOther}
                onChange={e => handleChange('statusOther', e.target.value)}
                placeholder="状況を入力"
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">開始時期（ストーリー中）</label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.start_in_story}
              onChange={e => handleChange('start_in_story', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">開始時期（リアル）</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.start_in_real}
              onChange={e => handleChange('start_in_real', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">画像</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-60"
              disabled={saving}
            >{saving ? '保存中...' : '保存'}</button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold"
              onClick={() => router.back()}
              disabled={saving}
            >キャンセル</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
