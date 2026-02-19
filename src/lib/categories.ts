export const CATEGORIES = [
  { value: "text", label: "文章・ライティング" },
  { value: "marketing", label: "マーケティング・営業" },
  { value: "programming", label: "プログラミング・開発" },
  { value: "business", label: "ビジネス・企画" },
  { value: "education", label: "教育・学習" },
  { value: "data", label: "データ分析・統計" },
  { value: "design", label: "デザイン・クリエイティブ" },
  { value: "translation", label: "翻訳・語学" },
  { value: "sns", label: "SNS・メディア" },
  { value: "other", label: "その他" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
