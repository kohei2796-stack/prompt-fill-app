-- prompt_templates に category カラムを追加
ALTER TABLE prompt_templates
  ADD COLUMN category TEXT NOT NULL DEFAULT 'その他';
