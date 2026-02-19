"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-primary">
          Prompt Fill
        </Link>
        {pathname !== "/new" ? (
          <Button asChild>
            <Link href="/new">＋ 新規投稿</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/">← 一覧に戻る</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
