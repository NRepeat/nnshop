import { sanityFetch } from '@/shared/sanity/lib/sanityFetch';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { PAGE_QUERY } from '@/shared/sanity/lib/query';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@shared/i18n/routing';
import { Metadata } from 'next';
import {
  formatTitle,
  generatePageMetadata,
} from '@shared/lib/seo/generateMetadata';
import { PortableText, type PortableTextBlock } from 'next-sanity';
import { components } from '@/shared/sanity/components/portableText';
import { ContactForm } from '@features/contact/ui/ContactForm';
import Logo from '@shared/assets/Logo';
import { notFound } from 'next/navigation';
import { JsonLd } from '@shared/ui/JsonLd';
import { generateWebPageJsonLd } from '@shared/lib/seo/jsonld';
import { SITE_URL } from '@shared/config/brand';

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
    'bonus-program': 'Бонусна програма',
  },
  ru: {
    contacts: 'Контакты',
    delivery: 'Доставка',
    sustainability: 'Устойчивое развитие',
    'payment-returns': 'Оплата и возврат',
    'public-offer-agreement': 'Публичная оферта',
    'privacy-policy': 'Политика конфиденциальности',
    'bonus-program': 'Бонусная программа',
  },
};

const seoTitles: Record<string, Record<string, string>> = {
  uk: {
    contacts: 'Контакти інтернет-магазину взуття та аксесуарів | MioMio',
    delivery: 'Доставка взуття та аксесуарів по Україні | MioMio',
    sustainability: 'Сталий розвиток та етична мода | MioMio',
    'payment-returns': 'Оплата і повернення товару — умови та строки | MioMio',
    'public-offer-agreement':
      'Публічна оферта — договір купівлі-продажу | MioMio',
    'privacy-policy': 'Політика конфіденційності та захист даних | MioMio',
    'bonus-program': 'Бонусна програма MioMio — 5% з кожної покупки',
  },
  ru: {
    contacts: 'Контакты интернет-магазина обуви и аксессуаров | MioMio',
    delivery: 'Доставка обуви и аксессуаров по Украине | MioMio',
    sustainability: 'Устойчивое развитие и этичная мода | MioMio',
    'payment-returns': 'Оплата и возврат товара — условия и сроки | MioMio',
    'public-offer-agreement':
      'Публичная оферта — договор купли-продажи | MioMio',
    'privacy-policy': 'Политика конфиденциальности и защита данных | MioMio',
    'bonus-program': 'Бонусная программа MioMio — 5% с каждой покупки',
  },
};

const pageDescriptions: Record<string, Record<string, string>> = {
  uk: {
    contacts:
      "Як з нами зв'язатися: месенджери, пошта, графік роботи та підтримка щодо замовлень. Відповідаємо швидко ✔️",
    delivery:
      'Умови доставки взуття та аксесуарів по Україні: терміни, вартість, служби доставки та отримання замовлення ✔️',
    'payment-returns':
      'Способи оплати 💳 Правила повернення ✔️ Строки та умови ⏳ Як оформити запит 🧾 Пояснюємо просто ⭐',
    'public-offer-agreement':
      "Умови продажу та використання сайту MioMio: оформлення замовлення, оплата, доставка, повернення, права та обов'язки сторін.",
    'privacy-policy':
      'Політика конфіденційності MioMio: як ми збираємо, використовуємо та захищаємо ваші персональні дані при покупці взуття онлайн.',
    'bonus-program':
      'Накопичуйте бонуси MioMio: 5% від суми покупки. 1 бонус = 1 грн, термін дії 1 рік. Списання — до 50% від суми наступного замовлення.',
  },
  ru: {
    contacts:
      'Как с нами связаться: мессенджеры, почта, график работы и поддержка по заказам. Отвечаем быстро ✔️',
    delivery:
      'Условия доставки обуви и аксессуаров по Украине: сроки, стоимость, службы доставки и получение заказа ✔️',
    'payment-returns':
      'Способы оплати 💳 Правила возврата ✔️ Сроки и условия ⏳ Как оформить запрос 🧾 Объясняем просто ⭐',
    'public-offer-agreement':
      'Условия продажи и использования сайта MioMio: оформление заказа, оплата, доставка, возврат, права и обязанности сторон.',
    'privacy-policy':
      'Политика конфиденциальности MioMio: как мы собираем, используем и защищаем ваши персональные данные при покупке обуви онлайн.',
    'bonus-program':
      'Накапливайте бонусы MioMio: 5% от суммы покупки. 1 бонус = 1 грн, срок действия 1 год. Списание — до 50% от суммы следующего заказа.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const hardcodedSlugs = [
    'contacts',
    'delivery',
    'sustainability',
    'payment-returns',
    'public-offer-agreement',
    'privacy-policy',
  ];

  const isHardcoded = hardcodedSlugs.includes(slug);

  const pageContent = isHardcoded
    ? null
    : await sanityFetch({
        query: PAGE_QUERY,
        params: { language: sanityLocale, slug },
        tags: [`page:${slug}`],
      });

  if (!isHardcoded && !pageContent) {
    notFound();
  }

  const title = seoTitles[locale]?.[slug] || pageTitles[locale]?.[slug] || slug;
  const description = pageDescriptions[locale]?.[slug];

  return generatePageMetadata(
    {
      title: formatTitle(title),
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
    'bonus-program',
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

  const seoTitle = seoTitles[locale]?.[slug] || pageTitle;
  const description = pageDescriptions[locale]?.[slug] || '';
  const url = `${SITE_URL}/${locale}/info/${slug}`;

  if (slug === 'contacts') {
    return (
      <div className="container my-10 min-h-screen">
        <JsonLd data={generateWebPageJsonLd(seoTitle, description, url)} />
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
        <div className="w-full justify-center">
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
    <div className=" min-h-screen py-8 md:py-12">
      <div className="container ">
        <JsonLd data={generateWebPageJsonLd(seoTitle, description, url)} />
        <article className="mx-auto max-w-2xl">
          <h1 className="mb-6 md:mb-8 text-balance text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-[1.1] text-foreground">
            {pageTitle}
          </h1>
          {slug === 'bonus-program' ? (
            <div className="mb-10 flex items-center gap-5 rounded-2xl bg-foreground p-6 md:p-8 text-background">
              <Logo className="h-10 md:h-12 w-auto text-background shrink-0" />
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-semibold tracking-tight leading-none">
                  5%
                </span>
                <span className="mt-1 text-sm md:text-base text-background/70">
                  {locale === 'uk'
                    ? 'кешбек з кожної покупки'
                    : 'кешбэк с каждой покупки'}
                </span>
              </div>
            </div>
          ) : null}
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
    </div>
  );
}
