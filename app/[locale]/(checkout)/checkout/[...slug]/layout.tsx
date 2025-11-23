import Receipt from '@features/checkout/receipt/ui/Receipt';
import CheckoutHeader from '@features/checkout/ui/CheckoutHeader';
import { Card } from '@shared/ui/card';
import { ChevronRight } from 'lucide-react';
import { Chicle } from 'next/font/google';
import { redirect } from 'next/navigation';
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = await params;

  return (
    <>
      <CheckoutHeader slug={slug} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {children}
        <Receipt />
      </div>
    </>
  );
}
