"use client";
import Header from '../../../components/Header';
import FamilyEditor from '../../../components/FamilyEditor';
import Footer from '../../../components/Footer';
import { supabase } from '../../../lib/supabaseClient';
import { useState, useEffect } from 'react';
interface CharacterOption {
  id: string;
  name: string;
  image_url: string | null;
}
import { useRouter } from 'next/navigation';


export default function CharacterNewPage() {
    // キャラクター選択肢
    const [characterOptions, setCharacterOptions] = useState<CharacterOption[]>([]);
    useEffect(() => {
      supabase
        .from('character')
        .select('id, name, image_url')
        .order('name', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) setCharacterOptions(data);
        });
    }, []);
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    read: '',
    birthday: '',
    handedness: '',
    blood_type: '',
    familyArr: [] as { type: string; name: string }[], // 辞書型配列
    profile: '',
    gender: '',
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
      // familyArrはオブジェクト配列→辞書型オブジェクトへ変換（nameはキャラクターID→キャラクター名）
      let familyJson = null;
      if (form.familyArr && form.familyArr.length > 0 && characterOptions.length > 0) {
        const dict: Record<string, string> = {};
        for (const rel of form.familyArr) {
          if (rel.type && rel.name) {
            const char = characterOptions.find(c => c.id === rel.name);
            dict[rel.type] = char ? char.name : rel.name;
          }
        }
        familyJson = dict;
      }
      // DB登録
      const { data, error: dbErr } = await supabase
        .from('character')
        .insert([
          {
            name: form.name,
            read: form.read,
            birthday: form.birthday || null,
            handedness: form.handedness,
            blood_type: form.blood_type,
            family: familyJson,
            profile: form.profile,
            gender: form.gender,
            image_url,
          },
        ])
        .select('id')
        .single();
      if (dbErr) throw dbErr;
      router.push(`/characters/${data.id}`);
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
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">キャラクター新規作成</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">キャラクター名<span className="text-red-500">*</span></label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">読み仮名（ひらがな）</label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.read}
              onChange={e => handleChange('read', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">生年月日</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.birthday}
              onChange={e => handleChange('birthday', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">利き手</label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.handedness}
              onChange={e => handleChange('handedness', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">血液型</label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.blood_type}
              onChange={e => handleChange('blood_type', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">家族構成</label>
            <FamilyEditor
              value={form.familyArr}
              onChange={arr => handleChange('familyArr', arr)}
              characterOptions={characterOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">プロフィール</label>
            <textarea
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.profile}
              onChange={e => handleChange('profile', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">性別</label>
            <input
              className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
              value={form.gender}
              onChange={e => handleChange('gender', e.target.value)}
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
