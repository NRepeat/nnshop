'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Logo from '@shared/assets/Logo';

export const Footer = () => {
  const t = useTranslations('Footer');

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

  return (
    <footer className="bg-black text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/">
              <Logo className="w-10 h-10 text-white" />
            </Link>
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} NNShop. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">
              {t('info_column_title')}
            </h3>
            <ul className="space-y-2 text-center md:text-left">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-400"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
