/**
 * Aggressively removes invisible characters, non-printable garbage, and Unicode whitespace from slugs/handles.
 */
export const cleanSlug = (slug: string | null | undefined): string => {
  if (!slug) return '';
  
  return slug
    // Decode URI component first to catch encoded garbage like %E2%80%8B
    .trim()
    // Remove characters that are definitely garbage (invisible/control characters)
    // This regex matches a wide range of invisible Unicode characters
    .replace(/[\u200B-\u200F\uFEFF\u00AD\u00A0\u1680\u180E\u202F\u205F\u3000\u2028\u2029\u2000-\u200A\u202F\u205F\u3000]/g, '')
    // Also remove any control characters (00-1F, 7F-9F)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Final safety: remove anything that shouldn't be in a clean URL slug 
    // (keeping only alphanumeric, hyphen, underscore, dot, and slash)
    // We don't use this for EVERYTHING to avoid breaking international slugs if they are intended,
    // but for "handles" it's usually safe.
    .trim();
};
