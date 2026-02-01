import { NavigationMenuItem } from '@shared/ui/navigation-menu';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { NavButton } from './NavButton';
import { Suspense } from 'react';
import { cookieFenderGet } from '../api/setCookieGender';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const PersistLinkNavigation = async (props: HeaderBarProps) => {
  const { locale } = props;
  const t = await getTranslations({ locale, namespace: 'Header.nav' });

  const resolveLinks = props.mainCategory?.map(async (category) => {
    const { collectionData } = category;

    let slug = '';

    if (collectionData?.id) {
      const url = await resolveShopifyLink(
        'collection',
        collectionData.id,
        locale,
      );
      if (url && url.handle) {
        slug = url.handle;
      }
    } else {
      slug = collectionData?.pageHandle || '';
    }

    return {
      slug: slug,
    };
  });

  const links = resolveLinks ? await Promise.all(resolveLinks) : [];
  return (
    <>
      {links &&
        links.map((link) => {
          const label = t.has(link.slug) ? t(link.slug) : link.slug;
          return (
            <NavigationMenuItem key={link.slug} className={`flex p-0`}>
              <Link href={`/${link.slug}`}>
                <Suspense
                  fallback={
                    <NavButton
                      children={
                        <div className="h-6 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
                      }
                      slug={link.slug}
                    />
                  }
                >
                  <GenderSession label={label} slug={link.slug} />
                </Suspense>
              </Link>
            </NavigationMenuItem>
          );
        })}
    </>
  );
};
const GenderSession = async ({
  label,
  slug,
}: {
  label: string;
  slug: string;
}) => {
  const gender = (await cookieFenderGet()) || 'woman';
  return (
    <NavButton gender={gender} slug={slug}>
      {label}
    </NavButton>
  );
};
