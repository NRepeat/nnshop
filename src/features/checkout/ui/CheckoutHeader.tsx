import { Steps } from '@entities/checkout/ui/Steps';
import Logo from '@shared/assets/Logo';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CheckoutHeader({ slug }: { slug: string[] }) {
  if (!slug || slug.length === 0) return redirect('/');
  const currentStep = slug[0];
  return (
    <header className=" sticky top-2    z-20  backdrop-blur-sm bg-card/60 border-card border-2">
      <div className="flex justify-center items-center  container  ">
        <div className="justify-items-center justify-center flex  py-1">
          <Link className="flex" href="/">
            <Logo className="w-10 h-10" />
          </Link>
        </div>
      </div>
      <Steps slug={currentStep} />
    </header>
  );
}
