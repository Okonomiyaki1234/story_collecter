"use client";
import Header from '../../components/Header';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ストーリー型
interface Story {
  id: string;
  title: string;
  summary: string;
  status: string;
  start_in_real: string;
  image_url: string | null;
  updated_at?: string;
}


async function fetchStories(order: 'asc' | 'desc', search: string): Promise<Story[]> {
  let query = supabase
    .from('story')
    .select('id, title, summary, status, start_in_real, image_url, updated_at');
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  query = query.order('title', { ascending: order === 'asc' });
  const { data, error } = await query;
  return data || [];
}


export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchStories(order, search).then((data) => {
      setStories(data);
      setLoading(false);
    });
  }, [order, search]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
      <Header />
      <div className="mt-8" />
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">ストーリー一覧</h1>
      <div className="w-full max-w-2xl mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 items-center">
          <button
            className={`px-3 py-1 rounded font-semibold border ${order === 'asc' ? 'bg-blue-500 text-white border-blue-600' : 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 border-zinc-300 dark:border-zinc-600'}`}
            onClick={() => setOrder('asc')}
          >タイトル昇順</button>
          <button
            className={`px-3 py-1 rounded font-semibold border ${order === 'desc' ? 'bg-blue-500 text-white border-blue-600' : 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 border-zinc-300 dark:border-zinc-600'}`}
            onClick={() => setOrder('desc')}
          >タイトル降順</button>
        </div>
        <input
          type="text"
          placeholder="タイトルで検索..."
          className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 w-full md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full max-w-2xl">
        {loading ? (
          <div className="text-center text-zinc-400 py-12">読み込み中...</div>
        ) : stories.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">ストーリーがありません</div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <div className="w-20 h-20 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                  {story.image_url ? (
                    <img src={story.image_url} alt="story" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs text-zinc-400">no image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-black dark:text-zinc-50">{story.title}</div>
                  <div className="text-zinc-700 dark:text-zinc-300 text-sm mb-1">{story.summary}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">状況: {story.status} ／ 開始時期（リアル）: {story.start_in_real}</div>
                  <div className="text-xs text-zinc-400">最終更新: {story.updated_at ? new Date(story.updated_at).toLocaleString() : '-'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-12">
        <Link href="/" className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">トップページへ</Link>
      </div>
    </div>
  );
}
