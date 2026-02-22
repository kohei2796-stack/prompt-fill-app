"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getSupabase, PromptTemplate, Comment } from "@/lib/supabase";
import { extractVariables, fillTemplate } from "@/lib/template";
import { getCategoryLabel, CATEGORIES } from "@/lib/categories";
import { useAuth } from "@/components/auth-provider";
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

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"use" | "edit">("use");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editExamples, setEditExamples] = useState<Record<string, string>>({});
  const [editRequired, setEditRequired] = useState<Record<string, boolean>>({});
  const [newVarName, setNewVarName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

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

  const missingRequired = useMemo(() => {
    if (!template) return [];
    const req = template.variable_required ?? {};
    return variables.filter((v) => {
      const isReq = req[v] !== false;
      return isReq && !values[v]?.trim();
    });
  }, [template, variables, values]);

  const canCopy = missingRequired.length === 0;

  // Fetch comments when template opens
  const fetchComments = useCallback(() => {
    if (!template) return;
    getSupabase()
      .from("comments")
      .select("*, profiles(username)")
      .eq("template_id", template.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComments((data as Comment[]) ?? []);
      });
  }, [template]);

  useEffect(() => {
    if (open && template) {
      fetchComments();
    }
  }, [open, template, fetchComments]);

  const handlePostComment = async () => {
    if (!user || !template || !commentText.trim()) return;
    setPostingComment(true);
    const { error } = await getSupabase().from("comments").insert({
      user_id: user.id,
      template_id: template.id,
      content: commentText.trim(),
    });
    setPostingComment(false);
    if (error) {
      toast.error("コメントの投稿に失敗しました");
      return;
    }
    setCommentText("");
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    await getSupabase().from("comments").delete().eq("id", commentId);
    fetchComments();
  };

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
      setNewVarName("");
      setComments([]);
      setCommentText("");
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
    setNewVarName("");
    setMode("edit");
  };

  const handleEditExampleChange = (key: string, value: string) => {
    setEditExamples((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditRequiredChange = (key: string, checked: boolean) => {
    setEditRequired((prev) => ({ ...prev, [key]: checked }));
  };

  const isEditRequired = (v: string) => editRequired[v] !== false;

  const handleEditRemoveVar = (v: string) => {
    setEditText((prev) =>
      prev.replace(new RegExp(`\\{\\{\\s*${escapeRegex(v)}\\s*\\}\\}`, "g"), ""),
    );
  };

  const handleEditAddVar = () => {
    const name = newVarName.trim();
    if (!name) return;
    if (editVariables.includes(name)) {
      toast.error("同じ名前の変数が既に存在します");
      return;
    }
    setEditText((prev) => {
      const sep = prev.endsWith("\n") || prev === "" ? "" : "\n";
      return prev + sep + `{{${name}}}`;
    });
    setNewVarName("");
  };

  const handleSaveEdit = async () => {
    if (!template) return;
    if (!editTitle.trim() || !editText.trim()) {
      toast.error("タイトルとテンプレート本文は必須です");
      return;
    }
    const currentVars = extractVariables(editText);
    const cleanExamples: Record<string, string> = {};
    const cleanRequired: Record<string, boolean> = {};
    for (const v of currentVars) {
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
      .select("*, profiles(username)")
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

  const handleDeleteTemplate = async () => {
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
              <DialogTitle>{template.title}</DialogTitle>
              {template.description && (
                <DialogDescription>{template.description}</DialogDescription>
              )}
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {getCategoryLabel(template.category)}
                </span>
                {template.profiles?.username && (
                  <span className="text-xs text-muted-foreground">
                    by {template.profiles.username}
                  </span>
                )}
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

            {/* コメントセクション */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">
                レビュー・コメント（{comments.length}件）
              </p>

              {comments.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-md border bg-muted/30 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {c.profiles?.username ?? "unknown"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString("ja-JP")}
                          </span>
                          {user?.id === c.user_id && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-[10px] text-muted-foreground hover:text-red-500"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="コメントを書く…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="shrink-0"
                    disabled={!commentText.trim() || postingComment}
                    onClick={handlePostComment}
                  >
                    送信
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  コメントするにはログインしてください
                </p>
              )}
            </div>

            {/* 編集・削除 */}
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
                  onClick={handleDeleteTemplate}
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

              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">
                    変数の管理
                    {editVariables.length > 0 && `（${editVariables.length}件）`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    例文・必須/任意の設定、変数の追加・削除ができます
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
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
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
                        <button
                          type="button"
                          onClick={() => handleEditRemoveVar(v)}
                          className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          ✕ 削除
                        </button>
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

                <div className="flex gap-2">
                  <Input
                    placeholder="新しい変数名を入力…"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEditAddVar();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={handleEditAddVar}
                    disabled={!newVarName.trim()}
                  >
                    ＋ 追加
                  </Button>
                </div>
              </div>
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
