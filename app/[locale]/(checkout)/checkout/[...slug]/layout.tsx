import { StepComp } from '@features/checkout/ui/StepComp';
import { Card } from '@shared/ui/card';
import { ChevronRight } from 'lucide-react';
import { redirect } from 'next/navigation';
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = await params;
  console.log('slug', slug);
  // if (!slug) return redirect('/');
  const steps = {
    info: {
      slug: 'info',
      link: '/checkout/info',
    },
    delivery: {
      slug: 'delivery',
      link: '/checkout/delivery',
    },
    payment: {
      slug: 'payment',
      link: '/checkout/payment',
    },
    success: {
      slug: 'success',
      link: '/checkout/success',
    },
  };
  return (
    <>
      <Card className=" px-4 py-3  overflow-x-auto shadow-none rounded-none sticky top-2   z-20  backdrop-blur-sm bg-card/60 border-card border-2">
        <div className="flex items-center justify-between overflow-x-auto ">
          {(Object.keys(steps) as Array<keyof typeof steps>).map(
            (step, index) => (
              <div
                key={steps[step].slug}
                className="flex items-center flex-shrink-0"
              >
                <StepComp
                  link={steps[step].link}
                  slug={steps[step].slug}
                  isActive={slug[0] === steps[step].slug}
                  isCompleted={
                    index < (Object.keys(steps).indexOf(slug[0]) || 0)
                  }
                />
                {index < Object.keys(steps).length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                )}
              </div>
            ),
          )}
        </div>
      </Card>
      <div className=" ">
        <div className="container space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 container">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">{children}</Card>
            </div>
            {/*<div className="col-span-1">
              <div className="sticky top-6">
                <Receipt
                  isSuccess={slug[0] === 'success'}
                  orderId={slug[1] || null}
                />
              </div>
            </div>*/}
          </div>
        </div>
      </div>
    </>
  );
}
