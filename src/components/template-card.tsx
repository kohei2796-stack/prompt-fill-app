"use client";

import { PromptTemplate } from "@/lib/supabase";
import { extractVariables } from "@/lib/template";
import { getCategoryLabel } from "@/lib/categories";

type Props = {
  template: PromptTemplate;
  isFavorite: boolean;
  showFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
};

export function TemplateCard({
  template,
  isFavorite,
  showFavorite,
  onToggleFavorite,
  onClick,
}: Props) {
  const variables = extractVariables(template.template_text);
  const date = new Date(template.created_at).toLocaleDateString("ja-JP");
  const authorName = template.profiles?.username;

  return (
    <article
      className="group cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {getCategoryLabel(template.category)}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        {showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`text-lg transition-colors ${
              isFavorite
                ? "text-red-500"
                : "text-gray-300 hover:text-red-400"
            }`}
            title={isFavorite ? "お気に入り解除" : "お気に入りに追加"}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        )}
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

      <div className="flex items-center justify-between">
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
        {authorName && (
          <span className="ml-auto text-xs text-muted-foreground">
            by {authorName}
          </span>
        )}
      </div>
    </article>
  );
}
