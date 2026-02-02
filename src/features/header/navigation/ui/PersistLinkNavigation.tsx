import { NavigationMenuItem } from '@shared/ui/navigation-menu';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { NavButton } from './NavButton';
import { Suspense } from 'react';
import { cookieFenderGet } from '../api/setCookieGender';
import { getTranslations } from 'next-intl/server';

export const PersistLinkNavigation = async (props: HeaderBarProps) => {
  const { locale, gender } = props;
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
                <GenderSession
                  label={label}
                  slug={link.slug}
                  gender={gender}
                />
              </Suspense>
            </NavigationMenuItem>
          );
        })}
    </>
  );
};
const GenderSession = async ({
  label,
  slug,
  gender,
}: {
  label: string;
  slug: string;
  gender: string;
}) => {
  return (
    <NavButton gender={gender} slug={slug}>
      {label}
    </NavButton>
  );
};
