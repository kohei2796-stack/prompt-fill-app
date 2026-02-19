"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            Prompt Fill
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/" className="transition-colors hover:text-foreground">
              プロンプト
            </Link>
          </nav>
        </div>
        <Button asChild size="sm">
          <Link href="/new">＋ 新規投稿</Link>
        </Button>
      </div>
    </header>
  );
}
