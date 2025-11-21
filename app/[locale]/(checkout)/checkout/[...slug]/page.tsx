import CheckoutView from '@widgets/checkout/ui/view';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
// export async function generateStaticParams() {
//   return [
//     { slug: ['info'] },
//     { slug: ['delivery'] },
//     { slug: ['payment'] },
//     { slug: ['success'] },
//     { slug: ['success', 'orderIdPlaceholder'] },
//   ];
// }

export default async function Page(props: Props) {
  const params = await props.params;
  const { slug } = params;

  // Extract orderId from URL for success page
  const orderId = slug[1] || '';

  return <CheckoutView orderId={orderId} slug={slug} />;
}
