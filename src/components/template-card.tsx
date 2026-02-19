"use client";

import { PromptTemplate } from "@/lib/supabase";
import { extractVariables } from "@/lib/template";
import { getCategoryLabel } from "@/lib/categories";

type Props = {
  template: PromptTemplate;
  onClick: () => void;
};

export function TemplateCard({ template, onClick }: Props) {
  const variables = extractVariables(template.template_text);
  const date = new Date(template.created_at).toLocaleDateString("ja-JP");

  return (
    <article
      className="group cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {getCategoryLabel(template.category)}
        </span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      <h3 className="mb-1.5 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
        {template.title}
      </h3>

      {template.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {template.description}
        </p>
      )}

      <p className="mb-3 line-clamp-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground font-mono">
        {template.template_text}
      </p>

      {variables.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {variables.map((v) => (
            <span
              key={v}
              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
