
export default function Home() {
  // 仮の作品データ
  const works = [
    {
      title: "異世界転生物語",
      summary: "現代日本から異世界に転生した主人公が、魔法と剣の世界で成長していく物語。",
      status: "第3章執筆中"
    },
    {
      title: "近未来SFノベル",
      summary: "AIと人間が共存する都市で起こる事件を描くサスペンス。",
      status: "プロット作成中"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">創作進捗＆あらすじ集</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400 text-center max-w-xl">
        自作創作の進捗状況やあらすじをまとめて管理・共有できるアプリです。<br />
        ログインなしで閲覧可能、ログインすると編集もできるようになります（今後対応予定）。
      </p>
      <button
        className="mb-8 px-6 py-2 rounded bg-zinc-300 text-zinc-700 font-semibold cursor-not-allowed opacity-60"
        disabled
        title="編集機能は今後追加予定です"
      >
        ＋ 作品を追加（要ログイン）
      </button>
      <div className="w-full max-w-2xl space-y-6">
        {works.map((work, idx) => (
          <div key={idx} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-2">{work.title}</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-1">{work.summary}</p>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">進捗: {work.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
