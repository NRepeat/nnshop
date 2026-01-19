import { getTranslations } from 'next-intl/server';

export const ProductDetails = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  return (
    <div className="border-[#ddd] border-y border-solid content-stretch flex gap-[72px] items-start px-[115px] py-[67px] w-full">
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          {t('design')}
        </p>
        <div className="content-stretch flex flex-col font-sans gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            {t('airyAndWarm')}
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            {t('airyAndWarmDescription')}
          </p>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          {t('quality')}
        </p>
        <div className="content-stretch flex flex-col font-sans gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            {t('madeInItaly')}
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            {t('madeInItalyDescription')}
          </p>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          {t('sustainability')}
        </p>
        <div className="content-stretch flex flex-col font-sans gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            {t('sustainableBabyAlpaca')}
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            {t('sustainableBabyAlpacaDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};
