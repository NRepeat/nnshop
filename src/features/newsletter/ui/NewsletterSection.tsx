import { getTranslations } from 'next-intl/server';
import { NewsletterForm } from './NewsletterForm';

export const NewsletterSection = async () => {
  const t = await getTranslations('Newsletter');
  return (
    <section className=" w-full bg-neutral-100 flex items-center justify-center">
      <div className=" max-w-xl flex flex-col gap-8 py-16 w-full">
        <p className="text-2xl md:text-3xl font-light text-center">
          {t('heading')}
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
};
