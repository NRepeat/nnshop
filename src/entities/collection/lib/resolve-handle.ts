export const GENDERED_HANDLES = new Set([
  'ryukzaky-cholovichi',
  'sumky-cholovichi',
  'tufli-cholovichi',
  'golovni-ubory-zhinochi',
  'shtany-ta-bryuky-zhinochi',
  'svitshoty-ta-kofty-cholovichi',
  'dzhynsy-cholovichi',
  'pidzhaky-zhinochi',
  'verhnij-odyag-zhinocha',
  'svetry-ta-dzhempery-cholovichi',
  'shorty-cholovichi',
  'verhnij-odyag-cholovicha',
  'krosivky-ta-kedy-cholovichi',
  'zhinoche-vzuttya',
  'choloviche-vzuttya',
  'zhinochyj-odyag',
  'cholovichyj-odyag',
]);

const GENDER_SUFFIXES: Record<string, string[]> = {
  man: ['cholovichi', 'cholovicha', 'cholovichyj', 'choloviche'],
  woman: ['zhinochi', 'zhinocha', 'zhinochyj', 'zhinoche'],
};

export function resolveCollectionHandle(slug: string, gender: string): string {
  const suffixes = GENDER_SUFFIXES[gender] || [];
  for (const suffix of suffixes) {
    const withSuffix = `${slug}-${suffix}`;
    if (GENDERED_HANDLES.has(withSuffix)) return withSuffix;
    const withPrefix = `${suffix}-${slug}`;
    if (GENDERED_HANDLES.has(withPrefix)) return withPrefix;
  }
  return slug;
}
