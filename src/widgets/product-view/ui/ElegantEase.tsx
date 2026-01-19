import { getTranslations } from 'next-intl/server';

export const ElegantEase = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  const imgImage = 'https://via.placeholder.com/652x652';
  const imgImage1 = 'https://via.placeholder.com/652x652';

  return (
    <div className="content-stretch flex flex-col gap-[48px] items-center relative w-full">
      <div className="content-stretch flex flex-col font-sans gap-[16px] items-center not-italic px-0 py-[20px] relative shrink-0 text-black text-center w-full">
        <p className="leading-[32px] relative shrink-0 text-[24px] w-full">
          {t('elegantEase')}
        </p>
        <p className="leading-[22px] relative shrink-0 text-[16px] w-full">
          {t('elegantEaseDescription')}
        </p>
      </div>
      <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full">
        <div className="basis-0 grow h-[652px] min-h-px min-w-px relative shrink-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt=""
              className="absolute h-[158.76%] left-[-4.08%] max-w-none top-[-57.06%] w-[162.24%]"
              src={imgImage}
            />
          </div>
        </div>
        <div className="basis-0 grow h-[652px] min-h-px min-w-px relative shrink-0">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
            src={imgImage1}
          />
        </div>
      </div>
    </div>
  );
};
