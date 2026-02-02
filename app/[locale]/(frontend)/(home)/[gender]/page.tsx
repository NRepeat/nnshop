import { genders, Locale, locales } from '@/shared/i18n/routing';
import { PageContent } from '@widgets/home/ui/view';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';

type Props = {
  params: Promise<{ locale: Locale; gender: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, gender } = await params;

  const titles: Record<string, Record<string, string>> = {
    uk: {
      man: 'Чоловіче взуття | Mio Mio',
      woman: 'Жіноче взуття | Mio Mio',
    },
    ru: {
      man: 'Мужская обувь | Mio Mio',
      woman: 'Женская обувь | Mio Mio',
    },
  };

  const descriptions: Record<string, Record<string, string>> = {
    uk: {
      man: 'Стильне чоловіче взуття в інтернет-магазині Mio Mio. Великий вибір моделей за найкращими цінами.',
      woman:
        'Стильне жіноче взуття в інтернет-магазині Mio Mio. Великий вибір моделей за найкращими цінами.',
    },
    ru: {
      man: 'Стильная мужская обувь в интернет-магазине Mio Mio. Большой выбор моделей по лучшим ценам.',
      woman:
        'Стильная женская обувь в интернет-магазине Mio Mio. Большой выбор моделей по лучшим ценам.',
    },
  };

  return generatePageMetadata(
    {
      title: titles[locale]?.[gender] || 'Mio Mio',
      description: descriptions[locale]?.[gender],
    },
    locale,
    `/${gender}`
  );
}

// export async function generateStaticParams() {
//   const params = [];
//   for (const gender of genders) {
//     for (const locale of locales) {
//       params.push({ locale: locale, gender: gender });
//     }
//   }
//   return params;
// }

export default async function Page({ params }: Props) {
  return <PageContent params={params} />;
}
