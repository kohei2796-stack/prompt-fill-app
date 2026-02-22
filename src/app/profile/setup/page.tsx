"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    // 既にプロフィールがある場合はトップへ
    if (profile) {
      router.push("/");
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("ユーザー名を入力してください");
      return;
    }
    if (!user) return;

    setSaving(true);
    const { error } = await getSupabase().from("profiles").insert({
      id: user.id,
      username: username.trim(),
    });
    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("そのユーザー名は既に使われています");
      } else {
        toast.error("エラー: " + error.message);
      }
      return;
    }
    await refreshProfile();
    toast.success("プロフィールを設定しました！");
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pt-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>ユーザー名を決めよう</CardTitle>
          <CardDescription>
            他のユーザーに表示される名前です。後から変更もできます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="ユーザー名を入力"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
            />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "設定中…" : "決定"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
