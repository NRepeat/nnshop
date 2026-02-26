import { Link } from '@shared/i18n/navigation';
import Logo from '@shared/assets/Logo';
import { getTranslations } from 'next-intl/server';
import { sanityFetch } from '@shared/sanity/lib/client';
import { FOOTER_QUERY } from '@shared/sanity/lib/query';

export const Footer = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'Footer' });

  const footerData = await sanityFetch({
    query: FOOTER_QUERY,
    tags: ['siteSettings', 'footer'],
  });
  const footer = footerData?.data?.footerSettings;

  const navLinks = [
    { title: t('contacts'), href: '/info/contacts' },
    { title: t('delivery'), href: '/info/delivery' },
    { title: t('payment_returns'), href: '/info/payment-returns' },
    {
      title: t('public_offer_agreement'),
      href: '/info/public-offer-agreement',
    },
    { title: t('privacy_policy'), href: '/info/privacy-policy' },
  ];

  const hasContactColumn =
    (footer?.workingHours?.uk ||
      footer?.workingHours?.ru ||
      footer?.address?.uk ||
      footer?.address?.ru ||
      (footer?.socialLinks && footer.socialLinks.length > 0)) ??
    false;

  const hasPaymentMethods =
    footer?.paymentMethods && footer.paymentMethods.length > 0;

  return (
    <footer className="bg-black text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-4">
            <Link href="/">
              <Logo className=" text-white" />
            </Link>
            <p className="text-gray-400 text-sm text-start">
              &copy; MIMIO. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold mb-4">
              {t('info_column_title')}
            </h3>
            <ul className="space-y-2 text-start">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:border-b hover:border-gray-400 transition-colors text-gray-400"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {hasContactColumn && (
            <div className="flex flex-col items-start gap-3">
              {(footer?.workingHours?.[locale as 'uk' | 'ru']) && (
                <p className="text-gray-400 text-sm">
                  {footer.workingHours[locale as 'uk' | 'ru']}
                </p>
              )}
              {(footer?.address?.[locale as 'uk' | 'ru']) && (
                <p className="text-gray-400 text-sm">
                  {footer.address[locale as 'uk' | 'ru']}
                </p>
              )}
              {footer?.socialLinks && footer.socialLinks.length > 0 && (
                <ul className="space-y-2">
                  {footer.socialLinks.map(
                    (link: { platform?: string | null; url?: string | null }) => (
                      <li key={link.platform ?? undefined}>
                        <a
                          href={link.url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 text-sm hover:text-white transition-colors"
                        >
                          {link.platform}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {hasPaymentMethods && (
          <div className="mt-8 flex flex-wrap gap-2">
            {footer!.paymentMethods!.map((method: string | null) => (
              <span
                key={method}
                className="text-xs text-gray-500 uppercase tracking-wide border border-gray-700 rounded px-2 py-0.5"
              >
                {method}
              </span>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};
