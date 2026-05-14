"use client";
import Header from '../../components/Header';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// キャラクター型
interface Character {
  id: string;
  name: string;
  image_url: string | null;
  stories: string[];
  updated_at?: string;
}

async function fetchCharacters(order: 'asc' | 'desc', search: string): Promise<Character[]> {
  let query = supabase
    .from('character')
    .select('id, name, read, image_url, updated_at, role:role(story:story(title))');
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  query = query.order('read', { ascending: order === 'asc' });
  const { data, error } = await query;
  if (!data) return [];
  // stories: ストーリータイトル配列に変換
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    stories: (c.role || []).map((r: any) => r.story?.title).filter(Boolean)
  }));
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCharacters(order, search).then((data) => {
      setCharacters(data);
      setLoading(false);
    });
  }, [order, search]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
      <Header />
      <div className="mt-8" />
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">キャラクター一覧</h1>
      <div className="w-full max-w-2xl mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 items-center">
          <button
            className={`px-3 py-1 rounded font-semibold border ${order === 'asc' ? 'bg-blue-500 text-white border-blue-600' : 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 border-zinc-300 dark:border-zinc-600'}`}
            onClick={() => setOrder('asc')}
          >名前昇順</button>
          <button
            className={`px-3 py-1 rounded font-semibold border ${order === 'desc' ? 'bg-blue-500 text-white border-blue-600' : 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 border-zinc-300 dark:border-zinc-600'}`}
            onClick={() => setOrder('desc')}
          >名前降順</button>
        </div>
        <input
          type="text"
          placeholder="名前で検索..."
          className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 w-full md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full max-w-2xl">
        {loading ? (
          <div className="text-center text-zinc-400 py-12">読み込み中...</div>
        ) : characters.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">キャラクターがありません</div>
        ) : (
          <div className="space-y-6">
            {characters.map((char) => (
              <Link
                key={char.id}
                href={`/characters/${char.id}`}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <div className="w-20 h-20 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                  {char.image_url ? (
                    <img src={char.image_url} alt="character" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs text-zinc-400">no image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-black dark:text-zinc-50">{char.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">登場ストーリー: {char.stories.join(', ')}</div>
                  <div className="text-xs text-zinc-400">最終更新: {char.updated_at ? new Date(char.updated_at).toLocaleString() : '-'}</div>
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
