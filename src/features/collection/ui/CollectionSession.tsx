import { notFound } from 'next/navigation';
import { Props } from '~/app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page';

export const CollectionSession = async ({ params }: Props) => {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }
  return <>test</>;
};
