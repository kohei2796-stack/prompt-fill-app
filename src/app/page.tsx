"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getSupabase, PromptTemplate } from "@/lib/supabase";
import { getCategoryLabel } from "@/lib/categories";
import { Sidebar } from "@/components/sidebar";
import { TemplateCard } from "@/components/template-card";
import { TemplateDialog } from "@/components/template-dialog";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(() => {
    getSupabase()
      .from("prompt_templates")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTemplates(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of templates) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, [templates]);

  const filtered = useMemo(() => {
    let result = templates;
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
  }, [templates, category, search]);

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
        {/* 検索バー */}
        <div className="mb-5">
          <Input
            placeholder="プロンプトを検索…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>

        {/* モバイル用カテゴリセレクト */}
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
            {category ? getCategoryLabel(category) : "すべてのプロンプト"}
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
            {search
              ? "検索条件に一致するテンプレートがありません。"
              : category
                ? "このカテゴリにはまだテンプレートがありません。"
                : "テンプレートがまだありません。「＋ 新規投稿」から作成してください。"}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
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
