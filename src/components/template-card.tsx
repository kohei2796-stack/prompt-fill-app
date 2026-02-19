"use client";

import { PromptTemplate } from "@/lib/supabase";
import { extractVariables } from "@/lib/template";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Props = {
  template: PromptTemplate;
  onClick: () => void;
};

export function TemplateCard({ template, onClick }: Props) {
  const variables = extractVariables(template.template_text);

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg">{template.title}</CardTitle>
        {template.description && (
          <CardDescription>{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="mb-3 line-clamp-3 text-sm text-muted-foreground font-mono whitespace-pre-wrap">
          {template.template_text}
        </p>
        {variables.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <span
                key={v}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {v}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
