"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PromptTemplate } from "@/lib/supabase";
import { extractVariables, fillTemplate } from "@/lib/template";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateDialog({ template, open, onOpenChange }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  const variables = useMemo(
    () => (template ? extractVariables(template.template_text) : []),
    [template],
  );

  const preview = useMemo(
    () => (template ? fillTemplate(template.template_text, values) : ""),
    [template, values],
  );

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    toast.success("クリップボードにコピーしました");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setValues({});
    onOpenChange(nextOpen);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
          {template.description && (
            <DialogDescription>{template.description}</DialogDescription>
          )}
        </DialogHeader>

        {variables.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">変数を入力</p>
            {variables.map((v) => (
              <div key={v} className="space-y-1">
                <label className="text-sm text-muted-foreground">{v}</label>
                <Input
                  placeholder={`{{${v}}} の値を入力…`}
                  value={values[v] || ""}
                  onChange={(e) => handleChange(v, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">プレビュー</p>
          <div className="rounded-lg border bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap">
            {preview}
          </div>
        </div>

        <Button onClick={handleCopy} className="w-full">
          コピー
        </Button>
      </DialogContent>
    </Dialog>
  );
}
