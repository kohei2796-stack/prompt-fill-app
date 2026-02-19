-- テーブル作成
CREATE TABLE prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  template_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS を有効化（開発用に全開放）
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON prompt_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON prompt_templates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON prompt_templates
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON prompt_templates
  FOR DELETE USING (true);
