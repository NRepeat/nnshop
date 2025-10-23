import { PageBuilder } from '@/components/sanity/PageBuilder';
import { sanityFetch } from '@/sanity/lib/live';
import { HOME_PAGE_QUERY } from '@/sanity/lib/query';

export default async function Page() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
  });
  console.log(page);
  return page?.homePage?.content ? (
    <PageBuilder
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
