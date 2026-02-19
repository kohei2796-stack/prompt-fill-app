"use client";

import { useEffect, useState, useMemo } from "react";
import { getSupabase, PromptTemplate } from "@/lib/supabase";
import { getCategoryLabel } from "@/lib/categories";
import { Sidebar } from "@/components/sidebar";
import { TemplateCard } from "@/components/template-card";
import { TemplateDialog } from "@/components/template-dialog";

export default function HomePage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("prompt_templates")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTemplates(data ?? []);
        setLoading(false);
      });
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of templates) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, [templates]);

  const filtered = category
    ? templates.filter((t) => t.category === category)
    : templates;

  return (
    <div className="flex gap-8">
      <div className="hidden md:block">
        <Sidebar selected={category} counts={counts} onSelect={setCategory} />
      </div>

      <div className="min-w-0 flex-1">
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
                {key}（{count}）
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
            {category
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
      />
    </div>
  );
}
