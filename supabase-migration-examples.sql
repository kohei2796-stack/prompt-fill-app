-- 変数の例文を保存するカラムを追加
ALTER TABLE prompt_templates
  ADD COLUMN variable_examples JSONB NOT NULL DEFAULT '{}';
