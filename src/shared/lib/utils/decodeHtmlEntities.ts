const entities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': '\u00a0',
};

export function decodeHtmlEntities(str: string): string {
  return str.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => entities[m] ?? m);
}
