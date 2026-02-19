"use client";

import { useEffect, useState } from "react";
import { getSupabase, PromptTemplate } from "@/lib/supabase";
import { TemplateCard } from "@/components/template-card";
import { TemplateDialog } from "@/components/template-dialog";

export default function HomePage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
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

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">テンプレート一覧</h1>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          読み込み中…
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          テンプレートがまだありません。「新規投稿」から作成してください。
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onClick={() => setSelected(t)}
            />
          ))}
        </div>
      )}

      <TemplateDialog
        template={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
