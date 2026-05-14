"use client";
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { supabase } from '../../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  summary: string;
  body: string;
  status: string;
  start_in_story: string | null;
  start_in_real: string | null;
  image_url: string | null;
  updated_at?: string;
}

interface Character {
  id: string;
  name: string;
  read?: string;
  image_url: string | null;
}

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  // 編集用state
  const [editData, setEditData] = useState<Partial<Story>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      // ストーリー本体取得
      const { data: s } = await supabase
        .from('story')
        .select('id, title, summary, body, status, start_in_story, start_in_real, image_url, updated_at')
        .eq('id', id)
        .single();
      setStory(s || null);
      setEditData(s || {});
      // 登場キャラクター取得（role経由）
      const { data: chars } = await supabase
        .from('role')
        .select('character:character(id, name, read, image_url)')
        .eq('story_id', id);
      setCharacters((chars || []).map((r: any) => r.character));
      setLoading(false);
    })();
    // 認証情報取得
    (async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        setRole(profile?.role ?? null);
      } else {
        setRole(null);
      }
    })();
  }, [id]);

  // 編集欄変更時
  const handleEditChange = (field: keyof Story, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // 保存処理
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const handleSave = async () => {
    if (!story) return;
    setSaveMsg(null);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('story')
      .update({
        title: editData.title,
        summary: editData.summary,
        body: editData.body,
        status: editData.status,
        start_in_story: editData.start_in_story,
        start_in_real: editData.start_in_real,
        image_url: editData.image_url,
        updated_at: now,
      })
      .eq('id', story.id);
    if (!error) {
      setStory({ ...story, ...editData, updated_at: now } as Story);
      setSaveMsg('保存しました');
      setTimeout(() => setSaveMsg(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
        <Header />
        <div className="mt-8" />
        <div className="text-center text-zinc-400 py-12">読み込み中...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
        <Header />
        <div className="mt-8" />
        <div className="text-center text-zinc-400 py-12">ストーリーが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
      <Header />
      <div className="mt-8" />
      <div className="w-full max-w-2xl mb-8">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">最終更新: {story.updated_at ? new Date(story.updated_at).toLocaleString() : '-'}</div>
        {/* 編集モード切替ボタン */}
        {user && role === 'user' && (
          <button
            className={`mb-4 px-4 py-2 rounded font-semibold ${editMode ? 'bg-zinc-400 text-white' : 'bg-blue-500 text-white'}`}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? '閲覧モードに戻る' : '編集モード'}
          </button>
        )}
        <div className="flex gap-6 items-start">
          <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
            {story.image_url ? (
              <img src={story.image_url} alt="story" className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs text-zinc-400">no image</span>
            )}
          </div>
          <div className="flex-1">
            {editMode ? (
              <input
                className="text-3xl font-bold mb-2 text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.title || ''}
                onChange={e => handleEditChange('title', e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2 text-black dark:text-zinc-50">{story.title}</h1>
            )}
            {editMode ? (
              <textarea
                className="text-zinc-700 dark:text-zinc-300 mb-2 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.summary || ''}
                onChange={e => handleEditChange('summary', e.target.value)}
                rows={2}
              />
            ) : (
              <div className="text-zinc-700 dark:text-zinc-300 mb-2">{story.summary}</div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.status || ''}
                onChange={e => handleEditChange('status', e.target.value)}
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">状況: {story.status}</div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.start_in_story || ''}
                onChange={e => handleEditChange('start_in_story', e.target.value)}
                placeholder="開始時期（ストーリー中）"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">開始時期（ストーリー中）: {story.start_in_story || '-'}</div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.start_in_real || ''}
                onChange={e => handleEditChange('start_in_real', e.target.value)}
                placeholder="開始時期（リアル）"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">開始時期（リアル）: {story.start_in_real || '-'}</div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">本文</h2>
          {editMode ? (
            <textarea
              className="whitespace-pre-line text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded p-4 min-h-[80px] w-full"
              value={editData.body || ''}
              onChange={e => handleEditChange('body', e.target.value)}
              rows={8}
            />
          ) : (
            <div className="whitespace-pre-line text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded p-4 min-h-[80px]">
              {story.body || <span className="text-zinc-400">（本文なし）</span>}
            </div>
          )}
        </div>
        {editMode && (
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={handleSave}
            >保存</button>
            {saveMsg && <div className="text-green-600 text-sm font-semibold">{saveMsg}</div>}
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">登場キャラクター</h2>
          {characters.length === 0 ? (
            <div className="text-zinc-400">キャラクター情報なし</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {characters.map((char) => (
                <div key={char.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm">
                  <div className="w-14 h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                    {char.image_url ? (
                      <img src={char.image_url} alt="character" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-zinc-400">no image</span>
                    )}
                  </div>
                  <div>
                    <div className="text-base font-bold text-black dark:text-zinc-50">{char.name}</div>
                    {char.read && <div className="text-xs text-zinc-500 dark:text-zinc-400">{char.read}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-8">
          <Link href="/stories" className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">ストーリー一覧へ</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
