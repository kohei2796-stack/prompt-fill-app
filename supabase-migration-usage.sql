-- =============================================
-- 推奨の使い方・おすすめAI フィールド追加
-- =============================================

ALTER TABLE prompt_templates
  ADD COLUMN IF NOT EXISTS recommended_usage TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recommended_ai TEXT NOT NULL DEFAULT '';
