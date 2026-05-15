import React from 'react';

type Relation = { type: string; target: string };
interface RelationEditorProps {
  value: Relation[];
  onChange: (arr: Relation[]) => void;
  allCharacters: { id: string; name: string; image_url: string | null }[];
  selfId: string;
}
const RelationEditor: React.FC<RelationEditorProps> = ({ value, onChange, allCharacters, selfId }) => {
  // キャラ選択肢（自分以外）
  const charOptions = allCharacters.filter(c => c.id !== selfId);
  const handleTypeChange = (idx: number, v: string) => {
    const arr = value.map((r, i) => i === idx ? { ...r, type: v } : r);
    onChange(arr);
  };
  const handleTargetChange = (idx: number, v: string) => {
    const arr = value.map((r, i) => i === idx ? { ...r, target: v } : r);
    onChange(arr);
  };
  const handleRemove = (idx: number) => {
    const arr = value.filter((_, i) => i !== idx);
    onChange(arr);
  };
  const handleAdd = () => {
    onChange([...value, { type: '', target: charOptions[0]?.id || '' }]);
  };
  return (
    <div className="flex flex-col gap-2">
      {value.map((rel, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-32"
            placeholder="関係"
            value={rel.type}
            onChange={e => handleTypeChange(idx, e.target.value)}
          />
          <select
            className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-40"
            value={rel.target}
            onChange={e => handleTargetChange(idx, e.target.value)}
          >
            {charOptions.map(c => (
              <option key={c.id} value={c.id}>
                {c.image_url ? '🖼️ ' : ''}{c.name}
              </option>
            ))}
          </select>
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
      >関係を追加</button>
    </div>
  );
};

export default RelationEditor;
