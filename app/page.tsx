
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';

type Story = {
  id: string;
  title: string;
  summary: string;
  status: string;
  start_in_real: string;
  image_url: string | null;
};

type Character = {
  id: string;
  name: string;
  image_url: string | null;
  stories: string[];
};

async function getStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('story')
    .select('id, title, summary, status, start_in_real, image_url')
    .order('updated_at', { ascending: false })
    .limit(5);
  return data || [];
}

async function getCharacters(): Promise<Character[]> {
  // キャラクターと紐づくストーリータイトルをrole経由で取得
  const { data, error } = await supabase
    .from('character')
    .select(`id, name, image_url, role:role(character_id), role(story:story(title))`)
    .order('updated_at', { ascending: false })
    .limit(5);
  if (!data) return [];
  // stories: ストーリータイトル配列に変換
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    stories: (c.role || []).map((r: any) => r.story?.title).filter(Boolean)
  }));
}

export default async function Home() {
  const stories = await getStories();
  const characters = await getCharacters();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
      <Header />
      <div className="mt-8" />
      <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">創作進捗＆あらすじ集</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400 text-center max-w-xl">
        自作創作の進捗状況やあらすじをまとめて管理・共有できるアプリです。<br />
        ログインなしで閲覧可能、ログインすると編集もできるようになります（今後対応予定）。
      </p>

      {/* ストーリーセクション */}
      <section className="w-full max-w-2xl mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">直近で編集・追加されたストーリー</h2>
        <div className="space-y-6">
          {stories.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">データがありません</div>
          ) : (
            stories.map((story) => (
              <div key={story.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
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
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* キャラクターセクション */}
      <section className="w-full max-w-2xl mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">直近で編集・追加されたキャラクター</h2>
        <div className="space-y-6">
          {characters.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">データがありません</div>
          ) : (
            characters.map((char) => (
              <div key={char.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
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
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-4 mt-8">
        <a href="/stories" className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">ストーリー一覧へ</a>
        <a href="/characters" className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">キャラクター一覧へ</a>
        <a href="/stories/new" className="px-4 py-2 rounded bg-zinc-300 text-zinc-700 font-semibold cursor-not-allowed opacity-60" tabIndex={-1} aria-disabled>ストーリーを追加（要ログイン）</a>
      </div>
    </div>
  );
}
