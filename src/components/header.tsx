"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "プロンプト" },
    { href: "/guide", label: "使い方" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            Prompt Fill
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Button asChild size="sm">
                <Link href="/new">＋ 新規投稿</Link>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {profile?.username ?? "未設定"}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  ログアウト
                </Button>
              </div>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
