"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getSupabase, PromptTemplate } from "@/lib/supabase";
import { getCategoryLabel } from "@/lib/categories";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { TemplateCard } from "@/components/template-card";
import { TemplateDialog } from "@/components/template-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  const fetchTemplates = useCallback(() => {
    getSupabase()
      .from("prompt_templates")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTemplates((data as PromptTemplate[]) ?? []);
        setLoading(false);
      });
  }, []);

  const fetchFavorites = useCallback(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    getSupabase()
      .from("favorites")
      .select("template_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setFavoriteIds(
          new Set((data ?? []).map((f: { template_id: string }) => f.template_id)),
        );
      });
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (templateId: string) => {
    if (!user) return;
    if (favoriteIds.has(templateId)) {
      await getSupabase()
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", templateId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    } else {
      await getSupabase()
        .from("favorites")
        .insert({ user_id: user.id, template_id: templateId });
      setFavoriteIds((prev) => new Set(prev).add(templateId));
    }
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of templates) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, [templates]);

  const filtered = useMemo(() => {
    let result = templates;
    if (showFavorites) {
      result = result.filter((t) => favoriteIds.has(t.id));
    }
    if (category) {
      result = result.filter((t) => t.category === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.template_text.toLowerCase().includes(q),
      );
    }
    return result;
  }, [templates, category, search, showFavorites, favoriteIds]);

  const handleDeleted = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setSelected(null);
  };

  const handleUpdated = (updated: PromptTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
    setSelected(null);
  };

  return (
    <div className="flex gap-8">
      <div className="hidden md:block">
        <Sidebar selected={category} counts={counts} onSelect={setCategory} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-5 flex gap-2">
          <Input
            placeholder="プロンプトを検索…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
          {user && (
            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              className={cn("shrink-0", showFavorites && "bg-primary")}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              ♥ お気に入り
            </Button>
          )}
        </div>

        <div className="mb-4 md:hidden">
          <select
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value || null)}
          >
            <option value="">すべてのカテゴリ</option>
            {Object.entries(counts).map(([key, count]) => (
              <option key={key} value={key}>
                {getCategoryLabel(key)}（{count}）
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {showFavorites
              ? "お気に入り"
              : category
                ? getCategoryLabel(category)
                : "すべてのプロンプト"}
          </h1>
          <span className="text-sm text-muted-foreground">
            {filtered.length}件
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            読み込み中…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {showFavorites
              ? "お気に入りに追加したプロンプトがありません。"
              : search
                ? "検索条件に一致するテンプレートがありません。"
                : category
                  ? "このカテゴリにはまだテンプレートがありません。"
                  : "テンプレートがまだありません。ログインして投稿してください。"}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isFavorite={favoriteIds.has(t.id)}
                showFavorite={!!user}
                onToggleFavorite={() => toggleFavorite(t.id)}
                onClick={() => setSelected(t)}
              />
            ))}
          </div>
        )}
      </div>

      <TemplateDialog
        template={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
