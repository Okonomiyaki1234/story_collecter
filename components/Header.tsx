"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    // サインイン・アウト時の自動反映
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  return (
    <header className="w-full bg-zinc-100 dark:bg-zinc-900 px-6 py-4 flex items-center justify-between shadow" style={{marginTop:0, marginBottom:'2rem'}}>
      <nav className="flex gap-4">
        <Link href="/" className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">トップページ</Link>
        <Link href="/stories" className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">ストーリー一覧</Link>
        <Link href="/characters" className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 font-semibold">キャラクター一覧</Link>
        <Link href="/stories/new" className="px-3 py-1 rounded bg-zinc-300 text-zinc-700 font-semibold">ストーリー追加</Link>
        <Link href="/login" className="px-3 py-1 rounded bg-blue-500 text-white font-semibold">ログイン</Link>
      </nav>
      {user && (
        <span className="text-sm text-blue-600 dark:text-blue-300 font-semibold">ログイン中</span>
      )}
    </header>
  );
}
