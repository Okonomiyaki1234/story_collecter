

"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

export default function LoginPage() {
	const [tab, setTab] = useState<"login" | "register">("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setLoading(false);
		if (error) {
			setMessage(error.message);
		} else {
			setMessage("ログイン成功！");
			router.push("/");
		}
	}

	async function handleRegister(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		const { error } = await supabase.auth.signUp({ email, password });
		setLoading(false);
		if (error) {
			setMessage(error.message);
		} else {
			setMessage("登録メールを送信しました。メールをご確認ください。");
		}
	}

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center pt-0 px-4">
			<Header />
			<div className="mt-8" />
			<h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">ログイン／新規登録</h1>
			<div className="flex gap-4 mb-8">
				<button
					className={`px-6 py-2 rounded-t bg-zinc-200 dark:bg-zinc-700 font-semibold text-black dark:text-zinc-50 ${tab === "login" ? "border-b-4 border-blue-500" : "opacity-60"}`}
					onClick={() => setTab("login")}
				>ログイン</button>
				<button
					className={`px-6 py-2 rounded-t bg-zinc-200 dark:bg-zinc-700 font-semibold text-black dark:text-zinc-50 ${tab === "register" ? "border-b-4 border-blue-500" : "opacity-60"}`}
					onClick={() => setTab("register")}
				>新規登録</button>
			</div>

			<div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-lg shadow-md p-8">
				{tab === "login" ? (
					<form onSubmit={handleLogin} className="flex flex-col gap-4">
						<input
							type="email"
							placeholder="メールアドレス"
							className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-black dark:text-zinc-50"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
						<input
							type="password"
							placeholder="パスワード"
							className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-black dark:text-zinc-50"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							autoComplete="current-password"
						/>
						<button
							type="submit"
							className="mt-2 px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
							disabled={loading}
						>
							{loading ? "ログイン中..." : "ログイン"}
						</button>
					</form>
				) : (
					<form onSubmit={handleRegister} className="flex flex-col gap-4">
						<input
							type="email"
							placeholder="メールアドレス"
							className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-black dark:text-zinc-50"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
						<input
							type="password"
							placeholder="パスワード"
							className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-black dark:text-zinc-50"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							autoComplete="new-password"
						/>
						<button
							type="submit"
							className="mt-2 px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
							disabled={loading}
						>
							{loading ? "登録中..." : "新規登録"}
						</button>
					</form>
				)}
				{message && (
					<div className="mt-4 text-center text-sm text-red-500 dark:text-red-400">{message}</div>
				)}
			</div>
		</div>
	);
}
