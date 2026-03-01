"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, Profile } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  // セッションがあり admin/sub_admin のユーザーのみアクセス可
  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthorized(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      const role = (data as { role: string } | null)?.role;
      setAuthorized(role === "admin" || role === "sub_admin");
    });
  }, []);

  useEffect(() => {
    if (authorized === false) router.replace("/");
  }, [authorized, router]);

  const fetchUsers = useCallback(async () => {
    const { data } = await getSupabase()
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as Profile[]);
  }, []);

  useEffect(() => {
    if (authorized) fetchUsers();
  }, [authorized, fetchUsers]);

  if (authorized === null || authorized === false) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">管理画面</h1>

      <div className="mb-4">
        <Input
          placeholder="ユーザー名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{filtered.length}件</p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">ユーザー名</th>
              <th className="px-4 py-3 text-left font-medium">ロール</th>
              <th className="px-4 py-3 text-left font-medium">登録日</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("ja-JP")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  該当するユーザーが見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
