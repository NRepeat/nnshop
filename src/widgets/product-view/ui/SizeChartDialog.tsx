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

const BootsSizeChart = ({ t }: { t: (key: string) => string }) => (
  <div className="flex flex-col gap-6">
    <DialogHeader>
      <DialogTitle className="text-center text-3xl font-light  font-serif">
        {t('boots.title')}
      </DialogTitle>
    </DialogHeader>
    {/* <p>
      {t.rich('boots.description', {
        br: () => <br />,
      })}
    </p> */}
    {/* @ts-ignore */}
    <div dangerouslySetInnerHTML={{ __html: t.raw('boots.description') }} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-2">
      {/* Контейнер для GIF (слева) */}
      <div className="flex flex-col items-center justify-center border border-black p-8 aspect-square md:aspect-auto h-full">
        <Image
          src="https://www.agl.com/static/version1767785856/frontend/GDL/agl-noshop/en_US/images/size_guide.gif"
          width={280}
          height={180}
          alt="Size guide animation"
          className="object-contain"
          unoptimized // Для корректной работы GIF через Next/Image
        />
      </div>

      {/* Таблица (справа) */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-center text-[13px]">
          <thead>
            <tr className="bg-white">
              <th className="border border-gray-300 p-2 font-medium">
                {t('boots.eu')}
              </th>
              <th className="border border-gray-300 p-2 font-medium">
                {t('boots.cm')}
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {/* Пример данных, как на скриншоте */}
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
);

// Для одежды делаем аналогичную стилизацию таблицы
const ClothesSizeChart = ({ t }: { t: (key: string) => string }) => (
  <div className="flex flex-col gap-6">
    <DialogHeader>
      <DialogTitle className="text-center text-3xl font-light italic font-serif">
        {t('clothes.title')}
      </DialogTitle>
    </DialogHeader>
    <p className="text-sm text-gray-700">{t('clothes.description')}</p>
    <table className="w-full border-collapse border border-gray-300 text-center text-[13px] mt-4">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothes.size')}
          </th>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothes.bust')}
          </th>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothes.waist')}
          </th>
          <th className="border border-gray-300 p-2 font-medium">
            {t('clothes.hips')}
          </th>
        </tr>
      </thead>
      <tbody className="text-gray-600">
        {[
          ['XS', '32-33', '24-25', '34-35'],
          ['S', '34-35', '26-27', '36-37'],
          ['M', '36-37', '28-29', '38-39'],
          ['L', '38-40', '30-32', '40-42'],
          ['XL', '41-43', '33-35', '43-45'],
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

export const SizeChartDialog = ({ productType }: { productType?: string }) => {
  const t = useTranslations('SizeChartDialog');
  const tProduct = useTranslations('ProductPage');
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
        {productType !== 'boots' ? (
          <BootsSizeChart t={t} />
        ) : (
          <ClothesSizeChart t={t} />
        )}
      </DialogContent>
    </Dialog>
  );
};
