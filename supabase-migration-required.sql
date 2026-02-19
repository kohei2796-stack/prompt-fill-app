-- 変数の必須/任意設定を保存するカラムを追加
ALTER TABLE prompt_templates
  ADD COLUMN variable_required JSONB NOT NULL DEFAULT '{}';
