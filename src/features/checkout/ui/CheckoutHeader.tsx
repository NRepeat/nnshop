import { Steps } from '@entities/checkout/ui/Steps';
import { redirect } from 'next/navigation';

export default async function CheckoutHeader({
  slug,
  locale,
}: {
  slug: string[];
  locale: string;
}) {
  if (!slug || slug.length === 0) return redirect('/');
  const currentStep = slug[0];
  return (
    <div className=" ">
      {/* <div className="flex justify-center items-center  container relative ">
        <div className="justify-items-center justify-center flex  py-1">
          <Link className="flex" href="/">
            <Logo className="w-10 h-10" />
          </Link>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <LanguageSwitcher />
        </div>
      </div> */}
      <Steps slug={currentStep} locale={locale} />
    </div>
  );
}
