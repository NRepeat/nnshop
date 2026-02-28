import { Link } from '@shared/i18n/navigation';
import Logo from '@shared/assets/Logo';
import { getTranslations } from 'next-intl/server';
import { sanityFetch } from '@shared/sanity/lib/client';
import { FOOTER_QUERY } from '@shared/sanity/lib/query';
import { Phone, Mail } from 'lucide-react';
import { Input } from '@shared/ui/input';

// Inline brand icons (lucide-react has no brand icons)
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const VisaIcon = () => (
  <svg width="48" height="30" viewBox="0 0 48 30" fill="none">
    <rect width="48" height="30" rx="4" fill="#1A1F71" />
    <text x="6" y="21" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="white" letterSpacing="1">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg width="48" height="30" viewBox="0 0 48 30" fill="none">
    <rect width="48" height="30" rx="4" fill="#252525" />
    <circle cx="18" cy="15" r="9" fill="#EB001B" />
    <circle cx="30" cy="15" r="9" fill="#F79E1B" />
    <path d="M24 7.8a9 9 0 0 1 0 14.4A9 9 0 0 1 24 7.8z" fill="#FF5F00" />
  </svg>
);

export const Footer = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'Footer' });

  const footerData = await sanityFetch({
    query: FOOTER_QUERY,
    tags: ['siteSettings', 'footer'],
  });
  const footer = footerData?.footerSettings;

  const socialLinks: Array<{ platform: string; url: string; icon: React.ReactNode }> = [
    {
      platform: 'facebook',
      url: footer?.socialLinks?.find((l: { platform?: string | null }) => l.platform === 'facebook')?.url ?? 'https://facebook.com',
      icon: <FacebookIcon />,
    },
    {
      platform: 'instagram',
      url: footer?.socialLinks?.find((l: { platform?: string | null }) => l.platform === 'instagram')?.url ?? 'https://instagram.com',
      icon: <InstagramIcon />,
    },
  ];

  const infoLinks = [
    { title: t('contacts'), href: '/info/contacts' },
    { title: t('delivery'), href: '/info/delivery' },
    { title: t('payment_returns'), href: '/info/payment-returns' },
    { title: t('public_offer_agreement'), href: '/info/public-offer-agreement' },
    { title: t('privacy_policy'), href: '/info/privacy-policy' },
  ];

  const categoryLinks = [
    { title: t('category_woman'), href: '/woman' },
    { title: t('category_man'), href: '/man' },
    { title: t('category_shoes'), href: '/woman/shoes' },
    { title: t('category_clothes'), href: '/woman/clothes' },
    { title: t('category_accessories'), href: '/woman/accessories' },
    { title: t('category_brands'), href: '/brands' },
  ];

  const workingHours =
    footer?.workingHours?.[locale as 'uk' | 'ru'] ?? t('working_hours');

  const phone1 = t('phone1');
  const phone2 = t('phone2');
  const email = t('email');

  return (
    <footer className="bg-[#1a1a1a] text-white  ">
      <div className=" mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Column 1 — Logo, socials, newsletter, payment */}
          <div className="flex flex-col gap-5 w-full">
            <Link href="/" className="inline-block">
              <Logo className="text-white h-10 w-auto" />
            </Link>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/30 rounded flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                  aria-label={link.platform}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-white">{t('subscribe_title')}</p>
              <form className="flex">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('subscribe_placeholder')}
                  className="flex-1 rounded-r-none bg-transparent border border-white/30 text-sm text-white placeholder-white/40 px-3 py-2 focus:outline-none focus:border-white/60 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-white rounded rounded-l-none text-black text-sm font-medium px-4 py-2 hover:bg-white/90 transition-colors whitespace-nowrap"
                >
                  {t('subscribe_button')}
                </button>
              </form>
            </div>

            {/* Payment icons */}
            <div className="flex gap-2 items-center">
              <VisaIcon />
              <MastercardIcon />
            </div>
          </div>

          {/* Column 2 — Categories */}
          {/* <div>
            <h3 className="text-base font-bold mb-4 text-white">
              {t('categories_column_title')}
            </h3>
            <ul className="space-y-2.5">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Column 3 — Info */}
          <div>
            <h3 className="text-base font-bold mb-4 text-white">
              {t('info_column_title')}
            </h3>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Working hours & contacts */}
          <div>
            <h3 className="text-base font-bold mb-4 text-white">
              {t('working_hours_title')}
            </h3>
            <div className="flex flex-col gap-3">
              <p className="text-white/60 text-sm">{workingHours}</p>

              <div className="flex items-start gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href={`tel:${phone1.replace(/-/g, '')}`} className="hover:text-white transition-colors">
                    {phone1}
                  </a>
                  <a href={`tel:${phone2.replace(/-/g, '')}`} className="hover:text-white transition-colors">
                    {phone2}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">
                  {email}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-center text-white/50 text-sm">
          {t('copyright')}
        </div>
      </div>
    </footer>
  );
};
