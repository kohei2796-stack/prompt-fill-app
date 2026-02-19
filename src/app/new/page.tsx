"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase";
import { extractVariables } from "@/lib/template";
import { CATEGORIES } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function NewTemplatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [category, setCategory] = useState("other");
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [required, setRequired] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const variables = extractVariables(templateText);

  const isRequired = (v: string) => required[v] !== false; // デフォルト必須

  const handleExampleChange = (key: string, value: string) => {
    setExamples((prev) => ({ ...prev, [key]: value }));
  };

  const handleRequiredChange = (key: string, checked: boolean) => {
    setRequired((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !templateText.trim()) {
      toast.error("タイトルとテンプレート本文は必須です");
      return;
    }
    const cleanExamples: Record<string, string> = {};
    const cleanRequired: Record<string, boolean> = {};
    for (const v of variables) {
      if (examples[v]?.trim()) {
        cleanExamples[v] = examples[v].trim();
      }
      cleanRequired[v] = isRequired(v);
    }
    setSaving(true);
    const { error } = await getSupabase().from("prompt_templates").insert({
      title: title.trim(),
      description: description.trim(),
      template_text: templateText.trim(),
      category,
      variable_examples: cleanExamples,
      variable_required: cleanRequired,
    });
    setSaving(false);
    if (error) {
      toast.error("保存に失敗しました: " + error.message);
      return;
    }
    toast.success("テンプレートを保存しました");
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
        ← 一覧に戻る
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>新規テンプレート作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">タイトル</label>
              <Input
                placeholder="例: ブログ記事の構成テンプレート"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">カテゴリ</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">説明文（任意）</label>
              <Input
                placeholder="このテンプレートの用途を簡潔に"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">テンプレート本文</label>
              <p className="text-xs text-muted-foreground">
                {"穴埋め箇所は {{変数名}} の形式で記述してください"}
              </p>
              <Textarea
                placeholder={
                  "例: {{ターゲット読者}} 向けに、{{テーマ}} について書いてください。"
                }
                rows={8}
                className="font-mono"
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
              />
            </div>

            {variables.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium">
                    変数の設定（{variables.length}件）
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    例文と必須/任意を設定できます
                  </p>
                </div>
                {variables.map((v) => (
                  <div key={v} className="space-y-2 rounded-md border bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {v}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {isRequired(v) ? "必須" : "任意"}
                        </span>
                        <Switch
                          checked={isRequired(v)}
                          onCheckedChange={(checked) =>
                            handleRequiredChange(v, checked)
                          }
                        />
                      </div>
                    </div>
                    <Input
                      placeholder={`例文: ${v}に入る値のサンプル`}
                      value={examples[v] || ""}
                      onChange={(e) => handleExampleChange(v, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "保存中…" : "テンプレートを保存"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
