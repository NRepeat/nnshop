import { Button } from '@shared/ui/button';
import { NavigationMenuItem } from '@shared/ui/navigation-menu';
import { Link } from '@shared/i18n/navigation';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';

export const PersistLinkNavigation = async (props: HeaderBarProps) => {
  const { locale } = props;
  const resolveLinks = props.mainCategory?.map(async (category) => {
    const { collectionData, title } = category;

    let slug = '';

    if (collectionData?.id) {
      const url = await resolveShopifyLink(
        'collection',
        collectionData.id,
        locale,
      );
      if (url && url.handle) {
        slug = url.handle;
      }
    } else {
      slug = collectionData?.pageHandle || '';
    }

    return {
      name: title,
      slug: slug,
    };
  });

  const links = resolveLinks ? await Promise.all(resolveLinks) : [];
  return (
    <>
      {links &&
        links.map((link) => (
          <NavigationMenuItem key={link.slug} className={`flex p-0`}>
            <Link href={`/${link.slug}`}>
              <Button
                className="rounded-none w-full  cursor-pointer  text-nowrap text-base font-300 font-sans h-full px-5 py-2"
                variant={'ghost'}
              >
                {link.name as any as string}
              </Button>
            </Link>
          </NavigationMenuItem>
        ))}
    </>
  );
};
