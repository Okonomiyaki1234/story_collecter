import React, { useState } from 'react';

export type FamilyRelation = { type: string; name: string };
export interface FamilyEditorProps {
  value: FamilyRelation[];
  onChange: (arr: FamilyRelation[]) => void;
  characterOptions: { id: string; name: string; image_url: string | null }[];
  selfId?: string;
}

const FamilyEditor: React.FC<FamilyEditorProps> = ({ value, onChange, characterOptions, selfId }) => {
  // キャラ選択肢（自分以外）
  const charOptions = characterOptions.filter(c => c.id !== selfId);
  const handleTypeChange = (idx: number, v: string) => {
    const arr = value.map((r, i) => i === idx ? { ...r, type: v } : r);
    onChange(arr);
  };
  // 検索UI用state
  const [searchIdx, setSearchIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const handleNameChange = (idx: number, v: string) => {
    const arr = value.map((r, i) => i === idx ? { ...r, name: v } : r);
    onChange(arr);
    setSearchIdx(null);
    setSearch('');
  };
  const handleRemove = (idx: number) => {
    const arr = value.filter((_, i) => i !== idx);
    onChange(arr);
  };
  // 追加時は空欄で追加
  const handleAdd = () => {
    onChange([...value, { type: '', name: '' }]);
  };
  // 入力不備警告
  const hasInvalid = value.some(rel => !rel.type || !rel.name);
  return (
    <div className="flex flex-col gap-2">
      {value.map((rel, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-32"
            placeholder="続柄（例: 母, 父, 兄, 姉, 妹, 祖父, 祖母 など）"
            value={rel.type}
            onChange={e => handleTypeChange(idx, e.target.value)}
          />
          {/* 検索付きキャラ選択UI */}
          <div className="relative w-40">
            <button
              type="button"
              className="flex items-center px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-full text-left"
              onClick={() => setSearchIdx(idx)}
            >
              {(() => {
                const c = charOptions.find(c => c.id === rel.name);
                return c ? (
                  <span className="flex items-center gap-1">
                    {c.image_url && <img src={c.image_url} alt="img" className="w-5 h-5 rounded inline-block mr-1" />}
                    {c.name}
                  </span>
                ) : <span className="text-zinc-400">キャラクター選択</span>;
              })()}
            </button>
            {searchIdx === idx && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg max-h-64 overflow-y-auto">
                <input
                  autoFocus
                  className="w-full px-2 py-1 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  placeholder="キャラ名で検索..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div>
                  {charOptions.filter(c =>
                    c.name.toLowerCase().includes(search.toLowerCase())
                  ).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="flex items-center gap-2 w-full px-2 py-1 hover:bg-blue-100 dark:hover:bg-zinc-800"
                      onClick={() => handleNameChange(idx, c.id)}
                    >
                      {c.image_url && <img src={c.image_url} alt="img" className="w-5 h-5 rounded" />}
                      <span>{c.name}</span>
                    </button>
                  ))}
                  {charOptions.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <div className="px-2 py-2 text-zinc-400">該当キャラなし</div>
                  )}
                </div>
                <button
                  type="button"
                  className="w-full text-xs text-zinc-500 py-1 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-b"
                  onClick={() => { setSearchIdx(null); setSearch(''); }}
                >閉じる</button>
              </div>
            )}
          </div>
          <button
            className="px-2 py-1 rounded bg-red-500 text-white text-xs"
            onClick={() => handleRemove(idx)}
            type="button"
          >削除</button>
        </div>
      ))}
      <button
        className="mt-2 px-3 py-1 rounded bg-blue-500 text-white text-xs w-fit"
        onClick={handleAdd}
        type="button"
      >家族を追加</button>
      {hasInvalid && (
        <div className="text-xs text-red-500 mt-1">※続柄・家族キャラ両方を入力してください（未入力は保存されません）</div>
      )}
    </div>
  );
};

export default FamilyEditor;
