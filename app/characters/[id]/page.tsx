"use client";
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { supabase } from '../../../lib/supabaseClient';
import { useEffect, useState } from 'react';
interface CharacterOption {
  id: string;
  name: string;
  image_url: string | null;
}
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FamilyEditor from '../../../components/FamilyEditor';

interface Character {
  id: string;
  name: string;
  read?: string;
  birthday?: string | null;
  handedness?: string | null;
  blood_type?: string | null;
  family?: any;
  profile?: string | null;
  gender?: string | null;
  image_url: string | null;
  updated_at?: string;
}

interface Story {
  id: string;
  title: string;
  image_url: string | null;
}

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Character>>({});
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [characterOptions, setCharacterOptions] = useState<CharacterOption[]>([]);
  // キャラクター選択肢取得
  useEffect(() => {
    supabase
      .from('character')
      .select('id, name, image_url')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setCharacterOptions(data);
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      // キャラクター本体取得
      const { data: c } = await supabase
        .from('character')
        .select('id, name, read, birthday, handedness, blood_type, family, profile, gender, image_url, updated_at')
        .eq('id', id)
        .single();
      setCharacter(c || null);
      setEditData(c || {});
      // 紐づくストーリー取得（role経由）
      const { data: s } = await supabase
        .from('role')
        .select('story:story(id, title, image_url)')
        .eq('character_id', id);
      setStories((s || []).map((r: any) => r.story));
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

  // familyArr: 編集用配列、family: DB保存用（辞書型）
  const [familyArr, setFamilyArr] = useState<{ type: string; name: string }[]>([]);
  // familyArrは編集用stateとして直接使い、editData.familyからの同期は初回のみ、または編集モード切替時のみ行う
  // ここではuseEffectを削除し、familyArrは消さない

  const handleEditChange = (field: keyof Character, value: any) => {
    if (field === 'family') {
      setEditData((prev) => ({ ...prev, family: value }));
    } else {
      setEditData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // familyArrの変更時はstateのみ更新、保存時に変換
  const handleFamilyArrChange = (arr: { type: string; name: string }[]) => {
    setFamilyArr(arr);
  };

  const handleSave = async () => {
    if (!character) return;
    setSaveMsg(null);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('character')
      .update({
        name: editData.name,
        read: editData.read,
        birthday: editData.birthday,
        handedness: editData.handedness,
        blood_type: editData.blood_type,
        family: editData.family,
        profile: editData.profile,
        gender: editData.gender,
        image_url: editData.image_url,
        updated_at: now,
      })
      .eq('id', character.id);
    if (!error) {
      setCharacter({ ...character, ...editData, updated_at: now } as Character);
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

  if (!character) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
        <Header />
        <div className="mt-8" />
        <div className="text-center text-zinc-400 py-12">キャラクターが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
      <Header />
      <div className="mt-8" />
      <div className="w-full max-w-2xl mb-8">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">最終更新: {character.updated_at ? new Date(character.updated_at).toLocaleString() : '-'}</div>
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
            {character.image_url ? (
              <img src={character.image_url} alt="character" className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs text-zinc-400">no image</span>
            )}
          </div>
          <div className="flex-1">
            {editMode ? (
              <input
                className="text-3xl font-bold mb-2 text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.name || ''}
                onChange={e => handleEditChange('name', e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2 text-black dark:text-zinc-50">{character.name}</h1>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.read || ''}
                onChange={e => handleEditChange('read', e.target.value)}
                placeholder="読み仮名（ひらがな）"
              />
            ) : (
              character.read && <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{character.read}</div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.birthday || ''}
                onChange={e => handleEditChange('birthday', e.target.value)}
                placeholder="生年月日"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">生年月日: {character.birthday || '-'}</div>
            )}
            {/* 家族構成編集UI or 閲覧UI */}
            {editMode ? (
              <div className="mt-2">
                <label className="block text-xs mb-1">家族構成</label>
                <FamilyEditor
                  value={familyArr}
                  onChange={handleFamilyArrChange}
                  characterOptions={characterOptions}
                  selfId={character.id}
                />
              </div>
            ) : (
              <div className="mt-2">
                <label className="block text-xs mb-1">家族構成</label>
                {(() => {
                  // familyは { 続柄: 名前 } の辞書型 or null
                  const fam: [string, string][] = character.family && typeof character.family === 'object' && !Array.isArray(character.family)
                    ? Object.entries(character.family) as [string, string][]
                    : [];
                  if (!fam.length) return <div className="text-zinc-400 text-xs">家族情報なし</div>;
                  // 名前→キャラ情報逆引き
                  const nameToChar: Record<string, CharacterOption> = Object.fromEntries(characterOptions.map(c => [c.name, c]));
                  return (
                    <div className="flex flex-wrap gap-3 mt-1">
                      {fam.map(([type, name]) => {
                        const charName = String(name);
                        const c = nameToChar[charName];
                        return (
                          <div key={type+charName} className="flex items-center gap-2 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <div className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                              {c?.image_url ? (
                                <img src={c.image_url} alt="img" className="object-cover w-full h-full" />
                              ) : (
                                <span className="text-xs text-zinc-400">no image</span>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-black dark:text-zinc-50">{charName}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">{type}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.handedness || ''}
                onChange={e => handleEditChange('handedness', e.target.value)}
                placeholder="利き手"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">利き手: {character.handedness || '-'}</div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.blood_type || ''}
                onChange={e => handleEditChange('blood_type', e.target.value)}
                placeholder="血液型"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">血液型: {character.blood_type || '-'}</div>
            )}
            {editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.gender || ''}
                onChange={e => handleEditChange('gender', e.target.value)}
                placeholder="性別"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">性別: {character.gender || '-'}</div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">プロフィール</h2>
          {editMode ? (
            <textarea
              className="whitespace-pre-line text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded p-4 min-h-[60px] w-full"
              value={editData.profile || ''}
              onChange={e => handleEditChange('profile', e.target.value)}
              rows={3}
            />
          ) : (
            <div className="whitespace-pre-line text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded p-4 min-h-[60px]">
              {character.profile || <span className="text-zinc-400">（プロフィールなし）</span>}
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
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">登場ストーリー</h2>
          {stories.length === 0 ? (
            <div className="text-zinc-400">ストーリー情報なし</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {stories.map((story) => (
                <div key={story.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm">
                  <div className="w-14 h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                    {story.image_url ? (
                      <img src={story.image_url} alt="story" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-zinc-400">no image</span>
                    )}
                  </div>
                  <div>
                    <div className="text-base font-bold text-black dark:text-zinc-50">{story.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-8">
          <Link href="/characters" className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">キャラクター一覧へ</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
