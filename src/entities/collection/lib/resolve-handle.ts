const GENDER_SUFFIXES: Record<string, string[]> = {
  man: ['cholovichi', 'cholovicha', 'cholovichyj', 'choloviche'],
  woman: ['zhinochi', 'zhinocha', 'zhinochyj', 'zhinoche'],
};

const ALL_GENDER_SUFFIXES = Object.values(GENDER_SUFFIXES).flat();

/** Returns true if the slug contains any known gender suffix as a dash-separated part. */
export function hasGenderedSuffix(slug: string): boolean {
  const parts = slug.split('-');
  return parts.some((part) => ALL_GENDER_SUFFIXES.includes(part));
}

/** Returns 'man' | 'woman' if the slug contains a gendered suffix, or null if it's gender-neutral. */
export function detectGenderFromHandle(slug: string): 'man' | 'woman' | null {
  const parts = slug.split('-');
  for (const [gender, suffixes] of Object.entries(GENDER_SUFFIXES)) {
    if (parts.some((part) => suffixes.includes(part))) {
      return gender as 'man' | 'woman';
    }
  }
  return null;
}

export function resolveCollectionHandle(
  slug: string,
  gender: string,
  knownHandles: Set<string>,
): string {
  const suffixes = GENDER_SUFFIXES[gender] || [];
  const parts = slug.split('-');

  for (const suffix of suffixes) {
    // Try inserting suffix at every position within the slug parts
    for (let i = 0; i <= parts.length; i++) {
      const candidate = [...parts.slice(0, i), suffix, ...parts.slice(i)].join(
        '-',
      );
      if (knownHandles.has(candidate)) return candidate;
    }
  }
  return slug;
}
