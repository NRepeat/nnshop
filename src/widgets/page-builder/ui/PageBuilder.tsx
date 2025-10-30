import { PAGE_QUERYResult } from '@/shared/sanity/types';
import { createDataAttribute } from 'next-sanity';
import { createDataAttributeConfig } from '../lib/createDataAttributeConfig';
import { blockComponents } from '../model/blockComponents';

type PageBuilderProps = {
  content: NonNullable<PAGE_QUERYResult>['content'];
  documentId: string;
  documentType: string;
};

export function PageBuilder({
  content,
  documentId,
  documentType,
}: PageBuilderProps) {
  return (
    <main
      data-sanity={createDataAttribute({
        ...createDataAttributeConfig,
        id: documentId,
        type: documentType,
        path: 'content',
      }).toString()}
      className="w-full flex justify-center flex-col "
    >
      {content?.map((block) => {
        const Component =
          blockComponents[block._type as keyof typeof blockComponents];
        if (!Component) {
          return <>Something went wrong</>;
        }
        //@ts-expect-error sanity
        return <Component key={block._key} {...block} />;
      })}
    </main>
  );
}
