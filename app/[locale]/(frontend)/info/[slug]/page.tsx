import { sanityFetch } from '@/shared/sanity/lib/client';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { PAGE_QUERY } from '@/shared/sanity/lib/query';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@shared/i18n/routing';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const pageTitles: Record<string, Record<string, string>> = {
  uk: {
    contacts: 'Контакти',
    delivery: 'Доставка та оплата',
    sustainability: 'Сталий розвиток',
    'payment-returns': 'Оплата та повернення',
    'public-offer-agreement': 'Договір публічної оферти',
    'privacy-policy': 'Політика конфіденційності',
  },
  ru: {
    contacts: 'Контакты',
    delivery: 'Доставка и оплата',
    sustainability: 'Устойчивое развитие',
    'payment-returns': 'Оплата и возврат',
    'public-offer-agreement': 'Договор публичной оферты',
    'privacy-policy': 'Политика конфиденциальности',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const title = pageTitles[locale]?.[slug] || slug;

  return generatePageMetadata(
    {
      title: `${title} | Mio Mio`,
    },
    locale,
    `/info/${slug}`
  );
}

export async function generateStaticParams() {
  const hardcodedSlugs = [
    'contacts',
    'delivery',
    'sustainability',
    'payment-returns',
    'public-offer-agreement',
    'privacy-policy',
  ];

  // Generate an array of { slug: string, locale: string } objects
  const staticParams = locales.flatMap((locale) =>
    hardcodedSlugs.map((slug) => ({
      slug,
      locale,
    })),
  );

  return staticParams;
}

export default async function InfoPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const pageContent = await sanityFetch({
    query: PAGE_QUERY,
    params: { language: sanityLocale, slug },
    revalidate: 3600,
  });
  return (
    <article className=" container prose md:prose-lg lg:prose-xl mb-10">
      <div>Page Builder is deprecated</div>
    </article>
  );
}
