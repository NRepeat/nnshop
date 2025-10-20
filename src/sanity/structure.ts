import type { StructureResolver } from 'sanity/structure';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) => {
  const { currentUser } = context;
  const isAdmin = currentUser?.roles.some(
    (role) => role.name === 'administrator',
  );
  return S.list()
    .title('Blog')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('faq').title('FAQs'),
      S.listItem()
        .id('siteSettings')
        .schemaType('siteSettings')
        .title('Site Settings')
        .child(
          S.editor()
            .id('siteSettings')
            .schemaType('siteSettings')
            .documentId('siteSettings'),
        ),

      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        if (['locale'].includes(item.getId()!)) {
          return isAdmin;
        }
        return (
          item.getId() &&
          ![
            'post',
            'category',
            'author',
            'page',
            'faq',
            'siteSettings',
          ].includes(item.getId()!)
        );
      }),
    ]);
};
