import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { NavButton } from './NavButton';
import { Suspense } from 'react';
import { cookieFenderGet } from '../api/setCookieGender';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import clsx from 'clsx';

export const PersistLinkNavigation = async (props: HeaderBarProps) => {
  const { locale } = props;
  const [t, gender] = await Promise.all([
    getTranslations({ locale, namespace: 'Header.nav' }),
    cookieFenderGet(),
  ]);
  const currentGender = gender || 'woman';

  const links =
    props.mainCategory?.map((category) => {
      const { collectionData } = category;
      let slug = '';
      if (collectionData?.id) {
        const resolved = resolveCollectionLink(
          collectionData,
          locale,
          currentGender,
        );
        slug = resolved.handle || collectionData?.pageHandle || '';
      } else {
        slug = collectionData?.pageHandle || '';
      }
      return {
        slug: slug,
      };
    }) || [];
  return (
    <ul className="flex items-center">
      {links &&
        links.map((link, index) => {
          const label = t.has(link.slug) ? t(link.slug) : link.slug;
          return (
              <li key={link.slug} className="flex p-0">
                <Link href={`/${locale}/${link.slug}`} prefetch>
                  <Suspense
                    fallback={
                      <NavButton
                        children={
                          <div className="h-6 w-20 animate-pulse bg-gray-200  rounded"></div>
                        }
                        slug={link.slug}
                      />
                    }
                  >
                    <GenderSession
                      label={label}
                      slug={link.slug}
                      className={clsx({
                        'hover:rounded-tl ': index === 0,
                        'hover:rounded-tr ': index === 1,
                      })}
                    />
                  </Suspense>
                </Link>
              </li>
          );
        })}
    </ul>
  );
};
const GenderSession = async ({
  label,
  slug,
  className,
}: {
  label: string;
  slug: string;
  className?: string;
}) => {
  const gender = (await cookieFenderGet()) || 'woman';
  return (
    <NavButton gender={gender} slug={slug} className={className}>
      {label}
    </NavButton>
  );
};
