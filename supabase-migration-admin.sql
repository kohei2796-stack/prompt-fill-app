-- =============================================
-- 管理者ダッシュボード用マイグレーション
-- =============================================

-- 1. profiles テーブルに role 列を追加
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('admin', 'sub_admin', 'user'));

-- 2. page_views テーブル作成（匿名アクセス記録用）
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 誰でも INSERT 可能（匿名アクセス記録）
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- 管理者のみ SELECT 可能
CREATE POLICY "Admins can read page views"
  ON page_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'sub_admin')
    )
  );

-- 3. profiles の管理者用ポリシー（role 更新は admin のみ）
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'sub_admin')
    )
  );

CREATE POLICY "Admin can update user roles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- 4. 管理者が favorites を閲覧できるポリシー
CREATE POLICY "Admins can read all favorites"
  ON favorites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'sub_admin')
    )
  );

-- 5. 管理者が comments を閲覧できるポリシー
CREATE POLICY "Admins can read all comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'sub_admin')
    )
  );

-- =============================================
-- 最初の管理者設定（手動で実行してください）
-- UPDATE profiles SET role = 'admin' WHERE username = 'あなたのユーザー名';
-- =============================================
