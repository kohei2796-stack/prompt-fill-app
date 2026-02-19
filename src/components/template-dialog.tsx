"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getSupabase, PromptTemplate } from "@/lib/supabase";
import { extractVariables, fillTemplate } from "@/lib/template";
import { getCategoryLabel, CATEGORIES } from "@/lib/categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

type Props = {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
  onUpdated: (template: PromptTemplate) => void;
};

export function TemplateDialog({
  template,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"use" | "edit">("use");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editExamples, setEditExamples] = useState<Record<string, string>>({});
  const [editRequired, setEditRequired] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const variables = useMemo(
    () => (template ? extractVariables(template.template_text) : []),
    [template],
  );

  const editVariables = useMemo(
    () => extractVariables(editText),
    [editText],
  );

  const preview = useMemo(
    () => (template ? fillTemplate(template.template_text, values) : ""),
    [template, values],
  );

  // 必須変数のうち未入力のものをチェック
  const missingRequired = useMemo(() => {
    if (!template) return [];
    const req = template.variable_required ?? {};
    return variables.filter((v) => {
      const isReq = req[v] !== false; // デフォルト必須
      return isReq && !values[v]?.trim();
    });
  }, [template, variables, values]);

  const canCopy = missingRequired.length === 0;

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    if (!canCopy) {
      toast.error("必須の変数をすべて入力してください");
      return;
    }
    await navigator.clipboard.writeText(preview);
    toast.success("クリップボードにコピーしました");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setValues({});
      setMode("use");
      setConfirmDelete(false);
    }
    onOpenChange(nextOpen);
  };

  const startEdit = () => {
    if (!template) return;
    setEditTitle(template.title);
    setEditDescription(template.description);
    setEditText(template.template_text);
    setEditCategory(template.category);
    setEditExamples(template.variable_examples ?? {});
    setEditRequired(template.variable_required ?? {});
    setMode("edit");
  };

  const handleEditExampleChange = (key: string, value: string) => {
    setEditExamples((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditRequiredChange = (key: string, checked: boolean) => {
    setEditRequired((prev) => ({ ...prev, [key]: checked }));
  };

  const isEditRequired = (v: string) => editRequired[v] !== false;

  const handleSaveEdit = async () => {
    if (!template) return;
    if (!editTitle.trim() || !editText.trim()) {
      toast.error("タイトルとテンプレート本文は必須です");
      return;
    }
    const cleanExamples: Record<string, string> = {};
    const cleanRequired: Record<string, boolean> = {};
    for (const v of editVariables) {
      if (editExamples[v]?.trim()) {
        cleanExamples[v] = editExamples[v].trim();
      }
      cleanRequired[v] = isEditRequired(v);
    }
    setSaving(true);
    const { data, error } = await getSupabase()
      .from("prompt_templates")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim(),
        template_text: editText.trim(),
        category: editCategory,
        variable_examples: cleanExamples,
        variable_required: cleanRequired,
      })
      .eq("id", template.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("更新に失敗しました: " + error.message);
      return;
    }
    toast.success("テンプレートを更新しました");
    onUpdated(data as PromptTemplate);
    setMode("use");
  };

  const handleDelete = async () => {
    if (!template) return;
    setDeleting(true);
    const { error } = await getSupabase()
      .from("prompt_templates")
      .delete()
      .eq("id", template.id);
    setDeleting(false);
    if (error) {
      toast.error("削除に失敗しました: " + error.message);
      return;
    }
    toast.success("テンプレートを削除しました");
    onDeleted(template.id);
  };

  if (!template) return null;

  const examples = template.variable_examples ?? {};
  const requiredMap = template.variable_required ?? {};

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {mode === "use" ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <DialogTitle>{template.title}</DialogTitle>
                  {template.description && (
                    <DialogDescription>{template.description}</DialogDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {getCategoryLabel(template.category)}
                </span>
              </div>
            </DialogHeader>

            {variables.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">変数を入力</p>
                {variables.map((v) => {
                  const isReq = requiredMap[v] !== false;
                  const isEmpty = !values[v]?.trim();
                  return (
                    <div key={v} className="space-y-1">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        {v}
                        {isReq ? (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                            必須
                          </span>
                        ) : (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                            任意
                          </span>
                        )}
                      </label>
                      <Input
                        placeholder={examples[v] || `{{${v}}} の値を入力…`}
                        value={values[v] || ""}
                        onChange={(e) => handleChange(v, e.target.value)}
                        className={
                          isReq && isEmpty
                            ? "border-red-200 focus-visible:ring-red-300"
                            : ""
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">プレビュー</p>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap">
                {preview}
              </div>
            </div>

            {!canCopy && (
              <p className="text-xs text-red-500">
                必須の変数をすべて入力するとコピーできます（残り{missingRequired.length}件）
              </p>
            )}

            <Button onClick={handleCopy} className="w-full" disabled={!canCopy}>
              コピー
            </Button>

            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={startEdit}
              >
                編集
              </Button>
              {!confirmDelete ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  削除
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "削除中…" : "本当に削除する"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>テンプレートを編集</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">タイトル</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">カテゴリ</label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium">説明文</label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">テンプレート本文</label>
                <Textarea
                  rows={8}
                  className="font-mono"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              </div>

              {editVariables.length > 0 && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium">
                      変数の設定（{editVariables.length}件）
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      例文と必須/任意を設定できます
                    </p>
                  </div>
                  {editVariables.map((v) => (
                    <div
                      key={v}
                      className="space-y-2 rounded-md border bg-white p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {v}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {isEditRequired(v) ? "必須" : "任意"}
                          </span>
                          <Switch
                            checked={isEditRequired(v)}
                            onCheckedChange={(checked) =>
                              handleEditRequiredChange(v, checked)
                            }
                          />
                        </div>
                      </div>
                      <Input
                        placeholder={`例文: ${v}に入る値のサンプル`}
                        value={editExamples[v] || ""}
                        onChange={(e) =>
                          handleEditExampleChange(v, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMode("use")}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1"
                disabled={saving}
                onClick={handleSaveEdit}
              >
                {saving ? "保存中…" : "保存"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
