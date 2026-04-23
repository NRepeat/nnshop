const GENDER_SUFFIXES: Record<string, string[]> = {
  man: ['cholovichi', 'cholovicha', 'cholovichyj', 'choloviche', 'muzhskie', 'muzhskaya', 'muzhskoj'],
  woman: ['zhinochi', 'zhinocha', 'zhinochyj', 'zhinoche', 'zhenskie', 'zhenskaya', 'zhenskij'],
};

const ALL_GENDER_SUFFIXES = Object.values(GENDER_SUFFIXES).flat();

/** Проверяет, есть ли в слаге гендерный маркер */
export function hasGenderedSuffix(slug: string): boolean {
  const parts = slug.split('-');
  return parts.some((part) => ALL_GENDER_SUFFIXES.includes(part));
}

const UKRAINIAN_GENDER_SUFFIXES = [
  'cholovichi', 'cholovicha', 'cholovichyj', 'choloviche',
  'zhinochi', 'zhinocha', 'zhinochyj', 'zhinoche',
];

/** Проверяет, есть ли в слаге именно украинский гендерный маркер */
export function hasUkrainianGenderedSuffix(slug: string): boolean {
  const parts = slug.split('-');
  return parts.some((part) => UKRAINIAN_GENDER_SUFFIXES.includes(part));
}

/** Определяет гендер на основе частей слага */
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
  // Если слаг уже содержит правильный гендерный суффикс и он существует — возвращаем его
  if (detectGenderFromHandle(slug) === gender && knownHandles.has(slug)) {
    return slug;
  }

  const suffixes = GENDER_SUFFIXES[gender] || [];
  const parts = slug.split('-');

  // 1. Сначала пробуем добавить суффикс в начало или в конец (самые частые случаи для SEO)
  for (const suffix of suffixes) {
    const atStart = [suffix, ...parts].join('-');
    if (knownHandles.has(atStart)) return atStart;

    const atEnd = [...parts, suffix].join('-');
    if (knownHandles.has(atEnd)) return atEnd;
  }

  // 2. Если не нашли, итерируемся по всем позициям (ваш оригинальный подход)
  for (const suffix of suffixes) {
    for (let i = 1; i < parts.length; i++) {
      const candidate = [...parts.slice(0, i), suffix, ...parts.slice(i)].join(
        '-',
      );
      if (knownHandles.has(candidate)) return candidate;
    }
  }

  return slug;
}
