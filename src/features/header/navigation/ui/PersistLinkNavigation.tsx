import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { NavButton } from './NavButton';
import { Suspense } from 'react';
import { cookieGenderGet } from '../api/setCookieGender';
import { getTranslations } from 'next-intl/server';
import clsx from 'clsx';
import { getMainMenu } from '../api/getMainMenu';

const BRANDS_SLUGS = ['brand', 'бренд', 'брендi', 'бренди'];
function isBrandsItem(item: { url: string; title: string }) {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  return BRANDS_SLUGS.some((s) => slug.includes(s) || title.includes(s));
}

const GENDER_SLUG_PATTERNS: Record<string, string[]> = {
  woman: ['woman', 'women', 'female', 'жен', 'женщин', 'жінк', 'zhinok', 'zhinoch'],
  man: ['man', 'men', 'male', 'муж', 'мужчин', 'чолов', 'cholovik', 'cholovichi'],
};
function matchesGender(item: { url: string; title: string }, gender: string) {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  return (GENDER_SLUG_PATTERNS[gender] || []).some(
    (s) => slug.includes(s) || title.includes(s),
  );
}

async function buildLevel2Map(locale: string): Promise<Record<string, string>> {
  try {
    const allItems = await getMainMenu({ locale });
    const womanRoot = allItems.find((item) => matchesGender(item, 'woman'));
    const manRoot = allItems.find((item) => matchesGender(item, 'man'));

    const wSubs = (womanRoot?.items ?? []).filter((s) => !isBrandsItem(s));
    const mSubs = (manRoot?.items ?? []).filter((s) => !isBrandsItem(s));

    const map: Record<string, string> = {};
    wSubs.forEach((wSub, i) => {
      const mSub = mSubs[i];
      if (!mSub) return;
      const wHandle = wSub.url.replace(/^\//, '');
      const mHandle = mSub.url.replace(/^\//, '');
      if (wHandle && mHandle) {
        map[wHandle] = mHandle;
        map[mHandle] = wHandle;
      }
    });
    return map;
  } catch {
    return {};
  }
}

export const PersistLinkNavigation = async (props: HeaderBarProps) => {
  const { locale } = props;
  const [t, gender, level2Map] = await Promise.all([
    getTranslations({ locale, namespace: 'Header.nav' }),
    cookieGenderGet(),
    buildLevel2Map(locale),
  ]);
  const currentGender = gender || 'woman';

  const links =
    props.mainCategory?.map((category) => {
      const { collectionData } = category;
      let slug = '';
      if (collectionData?.id) {
        const resolved = resolveCollectionLink(collectionData, locale, currentGender);
        slug = resolved.handle || collectionData?.pageHandle || '';
      } else {
        slug = collectionData?.pageHandle || '';
      }
      return { slug };
    }) || [];

  return (
    <ul className="flex items-center">
      {links.map((link, index) => {
        const label = t.has(link.slug) ? t(link.slug) : link.slug;
        return (
          <li key={link.slug} className="flex p-0">
            <Suspense
              fallback={
                <NavButton slug={link.slug}>
                  <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
                </NavButton>
              }
            >
              <GenderSession
                label={label}
                slug={link.slug}
                level2Map={level2Map}
                className={clsx({
                  'hover:rounded-tl': index === 0,
                  'hover:rounded-tr': index === 1,
                })}
              />
            </Suspense>
          </li>
        );
      })}
    </ul>
  );
};

const GenderSession = async ({
  label,
  slug,
  level2Map,
  className,
}: {
  label: string;
  slug: string;
  level2Map: Record<string, string>;
  className?: string;
}) => {
  const gender = (await cookieGenderGet()) || 'woman';
  return (
    <NavButton gender={gender} slug={slug} level2Map={level2Map} className={className}>
      {label}
    </NavButton>
  );
};
