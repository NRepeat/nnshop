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

type SizeChartCategory = 'shoes' | 'clothing';
type Gender = 'man' | 'woman' | 'unisex';

const SHOE_KEYWORDS = [
  // Ukrainian
  'взуття', 'кросівк', 'кед', 'черевик', 'ботильйон', 'туфл', 'мокасин',
  'сандал', 'босоніж', 'сабо', 'мюл', 'балетк', 'шльопанц', "в'єтнамк",
  'лофер', 'чобот', 'угг', 'сліпон', 'оксфорд',
  // Russian
  'обувь', 'кроссовк', 'кед', 'ботинк', 'ботильон', 'туфл', 'мокасин',
  'сандал', 'босонож', 'сабо', 'мюл', 'балетк', 'шлепанц', 'вьетнамк',
  'лофер', 'сапог', 'угг', 'слипон', 'оксфорд',
  // English
  'shoe', 'sneaker', 'boot', 'sandal', 'loafer', 'mule', 'slipper',
  'pump', 'flat', 'moccasin', 'clog', 'oxford',
];

const GENDER_HANDLE_MAP: Record<string, Gender> = {
  choloviche: 'man',
  zhinoche: 'woman',
  uniseks: 'unisex',
};

function resolveGender(product: any): Gender {
  const refs = product?.genderMetafield?.references?.edges ?? [];
  if (refs.length === 0) return 'woman';
  const handles: string[] = refs
    .map((e: any) => e.node?.handle)
    .filter(Boolean);
  const hasMen = handles.some((h) => GENDER_HANDLE_MAP[h] === 'man');
  const hasWomen = handles.some((h) => GENDER_HANDLE_MAP[h] === 'woman');
  const hasUnisex = handles.some((h) => GENDER_HANDLE_MAP[h] === 'unisex');
  if (hasUnisex || (hasMen && hasWomen)) return 'unisex';
  if (hasMen) return 'man';
  if (hasWomen) return 'woman';
  return 'woman';
}

function getSizeChartCategory(productType?: string): SizeChartCategory {
  if (!productType) return 'clothing';
  const normalized = productType.toLowerCase().trim();
  const isShoes = SHOE_KEYWORDS.some((kw) => normalized.includes(kw));
  return isShoes ? 'shoes' : 'clothing';
}

const WOMEN_SHOE_SIZES: [string, string, string][] = [
  ['35', '23', '22,5'],
  ['35,5', '23,3', '22,7'],
  ['36', '23,5', '23'],
  ['36,5', '23,8', '23,5'],
  ['37', '24,5', '24'],
  ['37,5', '24,8', '24,3'],
  ['38', '25', '24,5'],
  ['38,5', '25,3', '24,8'],
  ['39', '25,5', '25'],
  ['39,5', '25,8', '25,3'],
  ['40', '26', '25,5'],
  ['40,5', '26,3', '25,8'],
  ['41', '26,5', '26'],
];

const MEN_SHOE_SIZES: [string, string, string][] = [
  ['39', '25,5', '25'],
  ['39,5', '25,8', '25,3'],
  ['40', '26', '25,5'],
  ['40,5', '26,5', '25,8'],
  ['41', '27', '26'],
  ['41,5', '27,5', '26,5'],
  ['42', '28', '27'],
  ['42,5', '28,3', '27,5'],
  ['43', '29', '28'],
  ['43,5', '29,3', '28,5'],
  ['44', '29,5', '28,8'],
  ['44,5', '29,8', '29'],
  ['45', '30', '29,5'],
  ['45,5', '30,5', '29,7'],
  ['46', '31', '30,2'],
  ['46,5', '31,5', '30,5'],
  ['47', '32', '31'],
];

function getShoeSizes(gender: Gender) {
  if (gender === 'man') return { data: MEN_SHOE_SIZES, titleKey: 'shoes.titleMen' as const };
  if (gender === 'unisex') return { data: [...WOMEN_SHOE_SIZES, ...MEN_SHOE_SIZES.filter(r => parseFloat(r[0].replace(',', '.')) > 41)], titleKey: 'shoes.title' as const };
  return { data: WOMEN_SHOE_SIZES, titleKey: 'shoes.titleWomen' as const };
}

const ShoesSizeChart = ({ t, gender }: { t: (key: string) => string; gender: Gender }) => {
  const { data, titleKey } = getShoeSizes(gender);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-light font-serif">
            {t(titleKey)}
          </DialogTitle>
        </DialogHeader>
      </div>

      <div className="flex-col flex">
        <div className='flex'>
        {/* @ts-ignore */}
          <div dangerouslySetInnerHTML={{ __html: t.raw('shoes.description') }} />
          <div className="hidden md:flex flex-col items-center justify-center border border-black p-8 aspect-square md:aspect-auto h-full max-h-[250px]">
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

        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse border border-gray-300 text-center text-[13px]">
            <thead>
              <tr className="bg-white">
                <th className="border border-gray-300 p-2 font-medium">
                  {t('shoes.eu')}
                </th>
                <th className="border border-gray-300 p-2 font-medium">
                  {t('shoes.insoleLength')}
                </th>
                <th className="border border-gray-300 p-2 font-medium">
                  {t('shoes.footLength')}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {data.map((row, idx) => (
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
  );
};

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

export const SizeChartDialog = ({
  product,
}: {
  product: Product;
}) => {
  const t = useTranslations('SizeChartDialog');
  const tProduct = useTranslations('ProductPage');
  const category = getSizeChartCategory(product.productType);
  const gender = resolveGender(product);

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

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        {category === 'shoes' ? (
          <ShoesSizeChart t={t} gender={gender} />
        ) : (
          <ClothingSizeChart t={t} />
        )}
      </DialogContent>
    </Dialog>
  );
};
