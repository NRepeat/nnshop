'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Product } from '@shared/lib/shopify/types/storefront.types';

/**
 * Size chart categories based on Shopify Standard Product Taxonomy
 * @see https://shopify.github.io/product-taxonomy/releases/unstable/
 *
 * - shoes:    aa-8 (Apparel & Accessories > Shoes)
 * - clothing: aa-1 (Apparel & Accessories > Clothing)
 */
type SizeChartCategory = 'shoes' | 'clothing';

const PRODUCT_TYPE_MAP: Record<string, SizeChartCategory> = {
  // ── Shoes — Ukrainian ─────────────────────────────────────
  взуття: 'shoes',
  'кросівки та кеди': 'shoes',
  черевики: 'shoes',
  'черевики та ботильйони': 'shoes',
  туфлі: 'shoes',
  мокасини: 'shoes',
  сандалії: 'shoes',
  босоніжки: 'shoes',
  'сабо та мюлі': 'shoes',
  'балетки та мокасини': 'shoes',
  "шльопанці та в'єтнамки": 'shoes',
  "чоловіче взуття":'shoes',

  // ── Shoes — Russian ───────────────────────────────────────
  обувь: 'shoes',
  'кроссовки и кеды': 'shoes',
  ботинки: 'shoes',
  'ботинки и ботильоны': 'shoes',
  туфли: 'shoes',
  мокасины: 'shoes',
  сандалии: 'shoes',
  босоножки: 'shoes',
  'сабо и мюли': 'shoes',
  'балетки и мокасины': 'shoes',
  'шлепанцы и вьетнамки': 'shoes',

  // ── Clothing — Ukrainian ──────────────────────────────────
  одяг: 'clothing',
  'футболки та поло': 'clothing',
  'спортивні костюми': 'clothing',
  шорти: 'clothing',
  'штани та брюки': 'clothing',
  сорочки: 'clothing',
  'світшоти та кофти': 'clothing',
  'светри та джемпери': 'clothing',
  джинси: 'clothing',
  піджаки: 'clothing',
  'верхній одяг': 'clothing',
  'блузи та сорочки': 'clothing',
  спідниці: 'clothing',
  'сукні та сарафани': 'clothing',

  // ── Clothing — Russian ────────────────────────────────────
  одежда: 'clothing',
  'футболки и поло': 'clothing',
  'спортивные костюмы': 'clothing',
  шорты: 'clothing',
  'брюки и брюки': 'clothing',
  рубашки: 'clothing',
  'свитшоты и кофты': 'clothing',
  'свитера и джемпера': 'clothing',
  джинсы: 'clothing',
  пиджаки: 'clothing',
  'верхняя одежда': 'clothing',
  'блузы и рубашки': 'clothing',
  юбки: 'clothing',
  'платья и сарафаны': 'clothing',


};

function getSizeChartCategory(productType?: string): SizeChartCategory {
  if (!productType) return 'clothing';
  const normalized = productType.toLowerCase().trim();
  return PRODUCT_TYPE_MAP[normalized] ?? 'clothing';
}

const ShoesSizeChart = ({ t }: { t: (key: string) => string }) => (
  <div className="flex flex-col gap-6">
    <div className="flex">
      <DialogHeader>
        <DialogTitle className="text-center text-3xl font-light font-serif">
          {t('shoes.title')}
        </DialogTitle>
      </DialogHeader>
    </div>

    <div className="flex-col flex">
      <div className='flex'>
      {/* @ts-ignore */}
        <div dangerouslySetInnerHTML={{ __html: t.raw('shoes.description') }} />
        <div className="hidden md:flex  flex-col items-center justify-center border border-black p-8 aspect-square md:aspect-auto h-full max-h-[250px]">
          <Image
            src="https://www.agl.com/static/version1767785856/frontend/GDL/agl-noshop/en_US/images/size_guide.gif"
            width={280}
            height={180}
            alt="Size guide animation"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 items-start mt-2">
        {/* <div className=" hidden md:flex flex-col items-center justify-center border border-black p-8 aspect-square md:aspect-auto h-full max-h-[250px]">
          <Image
            src="https://www.agl.com/static/version1767785856/frontend/GDL/agl-noshop/en_US/images/size_guide.gif"
            width={280}
            height={180}
            alt="Size guide animation"
            className="object-contain"
            unoptimized
          />
        </div> */}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-center text-[13px]">
            <thead>
              <tr className="bg-white">
                <th className="border border-gray-300 p-2 font-medium">
                  {t('shoes.eu')}
                </th>
                <th className="border border-gray-300 p-2 font-medium">
                  {t('shoes.cm')}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {[
                ['35', '21.5'],
                ['35,5', '22'],
                ['36', '22'],
                ['36,5', '22.5'],
                ['37', '23'],
                ['37,5', '23.5'],
                ['38', '24'],
                ['38,5', '24'],
                ['39', '24.5'],
                ['39,5', '25'],
                ['40', '25.5'],
                ['40,5', '26'],
                ['41', '26'],
              ].map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="border border-gray-300 p-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const ClothingSizeChart = ({ t }: { t: (key: string) => string }) => (
  <div className="flex flex-col gap-6">
    <DialogHeader>
      <DialogTitle className="text-center text-3xl font-light font-serif">
        {t('clothing.title')}
      </DialogTitle>
    </DialogHeader>
    <p className="text-sm text-gray-700">{t('clothing.description')}</p>
    <table className="w-full border-collapse border border-gray-300 text-center text-[13px] mt-4">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothing.size')}
          </th>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothing.bust')}
          </th>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothing.waist')}
          </th>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothing.hips')}
          </th>
        </tr>
      </thead>
      <tbody className="text-gray-600">
        {[
          ['XS', '82-86', '62-66', '88-92'],
          ['S', '86-90', '66-70', '92-96'],
          ['M', '90-94', '70-74', '96-100'],
          ['L', '94-100', '74-80', '100-106'],
          ['XL', '100-106', '80-86', '106-112'],
        ].map((row, idx) => (
          <tr key={idx}>
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="border border-gray-300 p-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SIZE_CHART_COMPONENTS: Record<
  SizeChartCategory,
  React.FC<{ t: (key: string) => string }>
> = {
  shoes: ShoesSizeChart,
  clothing: ClothingSizeChart,
};

export const SizeChartDialog = ({
  productType,
}: {
  productType?: Product['productType'];
}) => {
  console.log(productType, 'productType');
  const t = useTranslations('SizeChartDialog');
  const tProduct = useTranslations('ProductPage');
  const category = getSizeChartCategory(productType);
  const ChartComponent = SIZE_CHART_COMPONENTS[category];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="p-0 h-auto text-xs uppercase tracking-widest underline decoration-gray-300 underline-offset-4 font-normal"
        >
          {tProduct('sizeChart')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <ChartComponent t={t} />
      </DialogContent>
    </Dialog>
  );
};
