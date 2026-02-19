/** テンプレート文字列から {{変数名}} を抽出してユニークな配列で返す */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(.+?)\}\}/g);
  if (!matches) return [];
  const names = matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim());
  return [...new Set(names)];
}

/** テンプレート文字列の {{変数名}} を values で置き換える */
export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{(.+?)\}\}/g, (_, key) => {
    const trimmed = key.trim();
    return values[trimmed] || `{{${trimmed}}}`;
  });
}
