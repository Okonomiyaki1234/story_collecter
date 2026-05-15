"use client";


import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { supabase } from '../../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';



import RelationEditor from '../../../components/RelationEditor';

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

const STATUS_OPTIONS = [
  '完成',
  '執筆中',
  '停滞中',
  '下書き',
  '下書き中',
  'プロット構想',
  'アイデアだけ',
  'その他',
];


interface Character {
  id: string;
  name: string;
  read?: string;
  image_url: string | null;
  _role?: {
    id: string;
    affiliation?: string;
    age?: number;
    height?: number;
    weight?: number;
    relations?: any;
    story_profile?: string;
  };
}

// キャラクター追加用型
interface CharacterSearchItem {
  id: string;
  name: string;
  read?: string;
  image_url: string | null;
}


export default function StoryDetailPage() {

  // --- state宣言は全てここでまとめてuseEffectより前に配置 ---
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [addCharMsg, setAddCharMsg] = useState<string | null>(null);
  const [roleEditData, setRoleEditData] = useState<Record<string, any>>({});
  const [openRoleEditors, setOpenRoleEditors] = useState<Record<string, boolean>>({});
  const [roleSaveMsg, setRoleSaveMsg] = useState<Record<string, string | null>>({});

  // 編集欄変更
  const handleRoleEditChange = (roleId: string, field: string, value: any) => {
    setRoleEditData(prev => {
      let next = { ...prev[roleId], [field]: value };
      // relationsArr→relations(JSON文字列)へ自動変換
      if (field === 'relationsArr') {
        next.relations = JSON.stringify(value);
      }
      return {
        ...prev,
        [roleId]: next
      };
    });
  };

  // 保存処理
  const handleRoleSave = async (roleId: string) => {
    const d = roleEditData[roleId];
    let relationsJson = null;
    if (d.relations) {
      try {
        relationsJson = JSON.parse(d.relations);
      } catch {
        setRoleSaveMsg(prev => ({ ...prev, [roleId]: 'relationsはJSON形式で入力してください' }));
        return;
      }
    }
    const { error } = await supabase
      .from('role')
      .update({
        affiliation: d.affiliation,
        age: d.age ? Number(d.age) : null,
        height: d.height ? Number(d.height) : null,
        weight: d.weight ? Number(d.weight) : null,
        relations: relationsJson,
        story_profile: d.story_profile
      })
      .eq('id', roleId);
    if (error) {
      setRoleSaveMsg(prev => ({ ...prev, [roleId]: '保存に失敗しました' }));
    } else {
      setRoleSaveMsg(prev => ({ ...prev, [roleId]: '保存しました' }));
      setTimeout(() => setRoleSaveMsg(prev => ({ ...prev, [roleId]: null })), 2000);
    }
  };

  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  // キャラクター追加用
  const [showAddChar, setShowAddChar] = useState(false);
  const [charSearch, setCharSearch] = useState('');
  const [charAllList, setCharAllList] = useState<CharacterSearchItem[]>([]); // 全キャラ
  const [charSearchList, setCharSearchList] = useState<CharacterSearchItem[]>([]); // 絞り込み結果
  const [charSearchLoading, setCharSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  // 編集用state
  const [editData, setEditData] = useState<Partial<Story> & { statusOther?: string }>({});

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
      // 登場キャラクター取得（role経由、role情報も取得）
      const { data: chars } = await supabase
        .from('role')
        .select('id, affiliation, age, height, weight, relations, story_profile, character:character(id, name, read, image_url)')
        .eq('story_id', id);
      setCharacters((chars || []).map((r: any) => ({
        ...r.character,
        _role: {
          id: r.id,
          affiliation: r.affiliation,
          age: r.age,
          height: r.height,
          weight: r.weight,
          relations: r.relations,
          story_profile: r.story_profile
        }
      })));
      // role編集用state初期化
      const roleEditInit: Record<string, any> = {};
      const openInit: Record<string, boolean> = {};
      (chars || []).forEach((r: any) => {
        let relationsArr = [];
        if (Array.isArray(r.relations)) {
          relationsArr = r.relations;
        } else if (typeof r.relations === 'string') {
          try { relationsArr = JSON.parse(r.relations); } catch {}
        } else if (r.relations) {
          relationsArr = [r.relations];
        }
        roleEditInit[r.id] = {
          affiliation: r.affiliation || '',
          age: r.age || '',
          height: r.height || '',
          weight: r.weight || '',
          relations: r.relations ? JSON.stringify(r.relations, null, 2) : '',
          relationsArr,
          story_profile: r.story_profile || ''
        };
        openInit[r.id] = false;
      });
      setRoleEditData(roleEditInit);
      setOpenRoleEditors(openInit);
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

  // キャラクター検索リスト（追加UI用）
  useEffect(() => {
    if (editMode && showAddChar) {
      setCharSearchLoading(true);
      supabase
        .from('character')
        .select('id, name, read, image_url')
        .order('read', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            setCharAllList([]);
            setCharSearchList([]);
            setCharSearchLoading(false);
            return;
          }
          // 既に追加済みは除外
          const addedIds = new Set(characters.map(c => c.id));
          const all = (data || []).filter((c: any) => !addedIds.has(c.id));
          setCharAllList(all);
          setCharSearchList(all);
          setCharSearchLoading(false);
        });
    } else {
      setCharAllList([]);
      setCharSearchList([]);
    }
  }, [editMode, showAddChar, characters]);

  // 編集欄変更時
  const handleEditChange = (field: keyof Story | 'statusOther', value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // 保存処理
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const handleSave = async () => {
    if (!story) return;
    setSaveMsg(null);
    const now = new Date().toISOString();
    let status = editData.status === 'その他' ? editData.statusOther : editData.status;
    const { error } = await supabase
      .from('story')
      .update({
        title: editData.title,
        summary: editData.summary,
        body: editData.body,
        status,
        start_in_story: editData.start_in_story,
        start_in_real: editData.start_in_real,
        image_url: editData.image_url,
        updated_at: now,
      })
      .eq('id', story.id);
    if (!error) {
      setStory({ ...story, ...editData, status, updated_at: now } as Story);
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
            {user && role === 'user' && editMode ? (
              <input
                className="text-3xl font-bold mb-2 text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.title || ''}
                onChange={e => handleEditChange('title', e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2 text-black dark:text-zinc-50">{story.title}</h1>
            )}
            {user && role === 'user' && editMode ? (
              <textarea
                className="text-zinc-700 dark:text-zinc-300 mb-2 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.summary || ''}
                onChange={e => handleEditChange('summary', e.target.value)}
                rows={2}
              />
            ) : (
              <div className="text-zinc-700 dark:text-zinc-300 mb-2">{story.summary}</div>
            )}
            {user && role === 'user' && editMode ? (
              <div className="mb-1">
                <select
                  className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                  value={editData.status || ''}
                  onChange={e => handleEditChange('status', e.target.value)}
                >
                  <option value="">選択してください</option>
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt === 'その他' ? 'その他（入力）' : opt}</option>
                  ))}
                </select>
                {editData.status === 'その他' && (
                  <input
                    className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                    value={editData.statusOther || ''}
                    onChange={e => handleEditChange('statusOther', e.target.value)}
                    placeholder="状況を入力"
                  />
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">状況: {story.status}</div>
            )}
            {user && role === 'user' && editMode ? (
              <input
                className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 w-full"
                value={editData.start_in_story || ''}
                onChange={e => handleEditChange('start_in_story', e.target.value)}
                placeholder="開始時期（ストーリー中）"
              />
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">開始時期（ストーリー中）: {story.start_in_story || '-'}</div>
            )}
            {user && role === 'user' && editMode ? (
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
          {user && role === 'user' && editMode ? (
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
        {user && role === 'user' && editMode && (
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
          {user && role === 'user' && editMode && (
            <div className="mb-4">
              <button
                className="px-3 py-1 rounded bg-blue-500 text-white font-semibold"
                onClick={() => setShowAddChar(v => !v)}
              >{showAddChar ? '追加を閉じる' : 'キャラクター追加'}</button>
              {showAddChar && (
                <div className="mt-4 p-4 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <input
                    type="text"
                    className="mb-2 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 w-full"
                    placeholder="キャラクター名で検索..."
                    value={charSearch}
                    onChange={e => {
                      const v = e.target.value;
                      setCharSearch(v);
                      if (!v) {
                        setCharSearchList(charAllList);
                      } else {
                        setCharSearchList(
                          charAllList.filter(c =>
                            c.name?.toLowerCase().includes(v.toLowerCase()) ||
                            (c.read && c.read.includes(v))
                          )
                        );
                      }
                    }}
                  />
                  <div className="border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900" style={{maxHeight:'320px',overflowY:'auto',minHeight:'120px'}}>
                    {charSearchLoading ? (
                      <div className="text-zinc-400 py-4">検索中...</div>
                    ) : charSearchList.length === 0 ? (
                      <div className="text-zinc-400 py-4">該当キャラクターなし</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-2">
                        {charSearchList.map(char => (
                          <div
                            key={char.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${selectedCharId === char.id ? 'bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-500' : 'hover:bg-blue-100 dark:hover:bg-blue-900 border-zinc-200 dark:border-zinc-700'}`}
                            onClick={() => setSelectedCharId(char.id)}
                          >
                            <div className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                              {char.image_url ? (
                                <img src={char.image_url} alt="character" className="object-cover w-full h-full" />
                              ) : (
                                <span className="text-xs text-zinc-400">no image</span>
                              )}
                            </div>
                            <div className="flex-1 truncate text-sm font-semibold text-black dark:text-zinc-50">{char.name}</div>
                            {selectedCharId === char.id && (
                              <span className="ml-2 text-blue-600 dark:text-blue-300 font-bold">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:bg-zinc-400"
                      disabled={!selectedCharId}
                      onClick={async () => {
                        if (!selectedCharId || !id) return;
                        setAddCharMsg(null);
                        const { error } = await supabase
                          .from('role')
                          .insert({ story_id: id, character_id: selectedCharId });
                        if (error) {
                          setAddCharMsg('追加に失敗しました');
                        } else {
                          setAddCharMsg('追加しました');
                          setSelectedCharId(null);
                          setCharSearch('');
                          // キャラクターリストを即時リフレッシュ（_role構造で統一）
                          const { data: chars } = await supabase
                            .from('role')
                            .select('id, affiliation, age, height, weight, relations, story_profile, character:character(id, name, read, image_url)')
                            .eq('story_id', id);
                          setCharacters((chars || []).map((r: any) => ({
                            ...r.character,
                            _role: {
                              id: r.id,
                              affiliation: r.affiliation,
                              age: r.age,
                              height: r.height,
                              weight: r.weight,
                              relations: r.relations,
                              story_profile: r.story_profile
                            }
                          })));
                          // role編集用stateも再初期化
                          const roleEditInit: Record<string, any> = {};
                          const openInit: Record<string, boolean> = {};
                          (chars || []).forEach((r: any) => {
                            roleEditInit[r.id] = {
                              affiliation: r.affiliation || '',
                              age: r.age || '',
                              height: r.height || '',
                              weight: r.weight || '',
                              relations: r.relations ? JSON.stringify(r.relations, null, 2) : '',
                              story_profile: r.story_profile || ''
                            };
                            openInit[r.id] = false;
                          });
                          setRoleEditData(roleEditInit);
                          setOpenRoleEditors(openInit);
                        }
                        setTimeout(() => setAddCharMsg(null), 2000);
                      }}
                    >選択したキャラクターを追加</button>
                    <button
                      className="px-4 py-2 rounded bg-zinc-300 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold"
                      onClick={() => { setSelectedCharId(null); setCharSearch(''); }}
                    >選択解除</button>
                  </div>
                  {addCharMsg && <div className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-300">{addCharMsg}</div>}
                </div>
              )}
            </div>
          )}
          {characters.length === 0 ? (
            <div className="text-zinc-400">キャラクター情報なし</div>
          ) : (
            <div className="flex flex-col gap-4">
              {characters.map((char) => {
                const roleId = char._role?.id;
                return (
                  <div key={char.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                        {char.image_url ? (
                          <img src={char.image_url} alt="character" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs text-zinc-400">no image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-black dark:text-zinc-50">{char.name}</div>
                        {char.read && <div className="text-xs text-zinc-500 dark:text-zinc-400">{char.read}</div>}
                      </div>
                      {user && role === 'user' && roleId && (
                        <button
                          className="ml-2 text-xl text-zinc-500 hover:text-blue-600 focus:outline-none"
                          onClick={() => setOpenRoleEditors(prev => ({ ...prev, [roleId]: !prev[roleId] }))}
                          aria-label="編集欄を開閉"
                        >
                          {openRoleEditors[roleId] ? '▼' : '▶'}
                        </button>
                      )}
                    </div>
                    {user && role === 'user' && roleId && openRoleEditors[roleId] && (
                      <div className="mt-4 p-4 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs mb-1">所属</label>
                            <input className="w-full px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              value={roleEditData[roleId]?.affiliation || ''}
                              onChange={e => handleRoleEditChange(roleId, 'affiliation', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">年齢</label>
                            <input type="number" className="w-full px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              value={roleEditData[roleId]?.age || ''}
                              onChange={e => handleRoleEditChange(roleId, 'age', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">身長</label>
                            <input type="number" className="w-full px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              value={roleEditData[roleId]?.height || ''}
                              onChange={e => handleRoleEditChange(roleId, 'height', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">体重</label>
                            <input type="number" className="w-full px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              value={roleEditData[roleId]?.weight || ''}
                              onChange={e => handleRoleEditChange(roleId, 'weight', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs mb-1">人間関係</label>
                            <RelationEditor
                              value={roleEditData[roleId]?.relationsArr || []}
                              onChange={arr => handleRoleEditChange(roleId, 'relationsArr', arr)}
                              allCharacters={characters}
                              selfId={char.id}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs mb-1">ストーリープロフィール</label>
                            <textarea className="w-full px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              rows={2}
                              value={roleEditData[roleId]?.story_profile || ''}
                              onChange={e => handleRoleEditChange(roleId, 'story_profile', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
                            onClick={() => handleRoleSave(roleId)}
                          >保存</button>
                          {roleSaveMsg[roleId] && <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">{roleSaveMsg[roleId]}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
