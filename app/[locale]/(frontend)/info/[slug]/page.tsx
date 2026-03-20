import { sanityFetch } from '@/shared/sanity/lib/sanityFetch';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { PAGE_QUERY } from '@/shared/sanity/lib/query';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@shared/i18n/routing';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';
import { PortableText, type PortableTextBlock } from 'next-sanity';
import { components } from '@/shared/sanity/components/portableText';
import { ContactForm } from '@features/contact/ui/ContactForm';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const pageTitles: Record<string, Record<string, string>> = {
  uk: {
    contacts: 'Контакти',
    delivery: 'Доставка',
    sustainability: 'Сталий розвиток',
    'payment-returns': 'Оплата і повернення',
    'public-offer-agreement': 'Публічна оферта',
    'privacy-policy': 'Політика конфіденційності',
  },
  ru: {
    contacts: 'Контакты',
    delivery: 'Доставка',
    sustainability: 'Устойчивое развитие',
    'payment-returns': 'Оплата и возврат',
    'public-offer-agreement': 'Публичная оферта',
    'privacy-policy': 'Политика конфиденциальности',
  },
};

const pageDescriptions: Record<string, Record<string, string>> = {
  uk: {
    contacts: 'Як з нами зв\'язатися: месенджери, пошта, графік роботи та підтримка щодо замовлень ✔️',
    delivery: 'Умови доставки по Україні: терміни, вартість, служби доставки та отримання замовлення.',
    'payment-returns': 'Способи оплати 💳 Правила повернення ✔️ Строки та умови ⏳ Як оформити запит 🧾 Пояснюємо просто ⭐',
    'public-offer-agreement': 'Умови продажу та використання сайту MioMio: оформлення замовлення, оплата, доставка, повернення, права та обов\'язки сторін.',
    'privacy-policy': 'Умови збору та обробки персональних даних у MioMio.',
  },
  ru: {
    contacts: 'Как с нами связаться: мессенджеры, почта, график работы и поддержка по заказам ✔️',
    delivery: 'Условия доставки по Украине: сроки, стоимость, службы доставки и получение заказа.',
    'payment-returns': 'Способы оплаты 💳 Правила возврата ✔️ Сроки и условия ⏳ Как оформить запрос 🧾 Объясняем просто ⭐',
    'public-offer-agreement': 'Условия продажи и использования сайта MioMio: оформление заказа, оплата, доставка, возврат, права и обязанности сторон.',
    'privacy-policy': 'Условия сбора и обработки персональных данных в MioMio.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const title = pageTitles[locale]?.[slug] || slug;
  const description = pageDescriptions[locale]?.[slug];

  return generatePageMetadata(
    {
      title: `${title} | MioMio`,
      description,
    },
    locale,
    `/info/${slug}`,
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
  const pageTitle = pageTitles[locale]?.[slug] ?? slug;
  if (slug === 'contacts') {
    return (
      <div className="container my-10 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
        <div className='w-full justify-center'>
        <ContactForm />

        </div>
      </div>
    );
  }
  const pageContent = await sanityFetch({
    query: PAGE_QUERY,
    params: { language: sanityLocale, slug },
    tags: [`page:${slug}`],
  });

  if (!pageContent) notFound();

  return (
    <div className="container flex">
      <article className=" prose-sm md:prose-lg lg:prose-lg my-8 h-fit  md:min-w-6xl min-h-screen ">
        <h1>{pageTitle}</h1>
        {/* @ts-ignore */}
        {pageContent?.content?.map((block) => {
          if (block._type !== 'contentPageBlock') return null;
          const body = block.body as PortableTextBlock[] | null | undefined;
          if (!body) return null;
          return (
            <div key={block._key} className="w-full">
              <PortableText value={body} components={components} />
            </div>
          );
        })}
      </article>
    </div>
  );
}
