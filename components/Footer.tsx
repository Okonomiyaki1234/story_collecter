"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-100 dark:bg-zinc-900 px-6 py-8 flex flex-col items-center mt-16 border-t border-zinc-200 dark:border-zinc-700">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex gap-6 mb-4">
          {/* 外部リンクダミー */}
          <a href="#" className="text-blue-500 hover:underline text-sm">ダミー</a>
          <a href="#" className="text-blue-500 hover:underline text-sm">ダミー２</a>
        </div>
        <div className="text-zinc-500 dark:text-zinc-400 text-sm">&copy; 渡し守</div>
      </div>
    </footer>
  );
}
