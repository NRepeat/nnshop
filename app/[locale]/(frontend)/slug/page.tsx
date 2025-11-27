import { Locale } from '@/shared/i18n/routing';

type RouteProps = {
  params: Promise<{ slug: string; locale: Locale }>;
};

// const getPage = async (params: RouteProps['params']) =>
//   sanityFetch({
//     query: PAGE_QUERY,
//     params: await params,
//   });

// export async function generateMetadata({
//   params,
// }: RouteProps): Promise<Metadata> {
//   const page = await getPage(params);
//   const { locale } = await params;
//   if (!page) {
//     return {};
//   }

//   const metadata: Metadata = {
//     metadataBase: new URL('https://close-dane-shining.ngrok-free.app'),
//     title: isLocalizedString(page.seo.title)
//       ? page.seo.title[locale]
//       : page.seo.title,
//     description: page.seo.description,
//   };

//   metadata.openGraph = {
//     images: {
//       url: page.seo.image
//         ? urlFor(page.seo.image).width(1200).height(630).url()
//         : `/api/og?id=${page._id}`,
//       width: 1200,
//       height: 630,
//     },
//   };

//   if (page.seo.noIndex) {
//     metadata.robots = 'noindex';
//   }

//   return metadata;
// }

export default async function Page({ params }: RouteProps) {
  const { slug } = await params;
  return <>{slug}</>;
}
