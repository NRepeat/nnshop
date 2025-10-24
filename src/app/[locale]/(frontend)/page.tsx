import { PageBuilder } from '@/components/sanity/PageBuilder';
import { sanityFetch } from '@/sanity/lib/live';
import { HOME_PAGE_QUERY } from '@/sanity/lib/query';

export default async function Page() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
  });
  return page?.homePage?.content ? (
    <PageBuilder
      //@ts-expect-error @ts-ignore
      content={page?.homePage.content}
      documentId={page.homePage._id}
      documentType={page.homePage._type}
    />
  ) : (
    <div>
      <h1>Page Not Found</h1>
    </div>
  );
}
