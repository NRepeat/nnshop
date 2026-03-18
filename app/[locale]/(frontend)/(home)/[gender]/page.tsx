import { Locale } from '@/shared/i18n/routing';
import { PageContent } from '@widgets/home/ui/view';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';

type Props = {
  params: Promise<{ locale: Locale; gender: string }>;
};

export function generateStaticParams() {
  return [
    { locale: 'uk', gender: 'woman' },
    { locale: 'uk', gender: 'man' },
    { locale: 'ru', gender: 'woman' },
    { locale: 'ru', gender: 'man' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, gender } = await params;

  const titles: Record<string, Record<string, string>> = {
    uk: {
      man: 'Чоловіче взуття та одяг — купити онлайн | MioMio',
      woman: 'Жіноче взуття та одяг — купити онлайн | MioMio',
    },
    ru: {
      man: 'Мужская обувь и одежда — купить онлайн | MioMio',
      woman: 'Женская обувь и одежда — купить онлайн | MioMio',
    },
  };

  const descriptions: Record<string, Record<string, string>> = {
    uk: {
      man: 'Широкий вибір чоловічого взуття та одягу в MioMio. Актуальні колекції, зручне замовлення онлайн та доставка по Україні ✔️',
      woman:
        'Широкий вибір жіночого взуття та одягу в MioMio. Актуальні колекції, зручне замовлення онлайн та доставка по Україні ✔️',
    },
    ru: {
      man: 'Широкий выбор мужской обуви и одежды в MioMio. Актуальные коллекции, удобный заказ онлайн и доставка по Украине ✔️',
      woman:
        'Широкий выбор женской обуви и одежды в MioMio. Актуальные коллекции, удобный заказ онлайн и доставка по Украине ✔️',
    },
  };

  return generatePageMetadata(
    {
      title: titles[locale]?.[gender] || 'Mio Mio',
      description: descriptions[locale]?.[gender],
    },
    locale,
    `/${gender}`,
  );
}



export default async function Page({ params }: Props) {
  return <PageContent params={params} />;
}
