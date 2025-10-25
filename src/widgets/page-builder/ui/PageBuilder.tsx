'use client';
import { useOptimistic } from 'next-sanity/hooks';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import { createDataAttribute } from 'next-sanity';
import { createDataAttributeConfig } from '../lib/createDataAttributeConfig';
import { blockComponents } from '../model/blockComponents';
import { DragHandle } from './DragHandle';

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
  const blocks = useOptimistic<
    NonNullable<PAGE_QUERYResult>['content'] | undefined,
    NonNullable<PAGE_QUERYResult>
  >(content, (state, action) => {
    if (action.id === documentId) {
      return action?.document?.content?.map(
        (block) => state?.find((s) => s._key === block?._key) || block,
      );
    }
    return state;
  });

  if (!Array.isArray(blocks)) {
    return null;
  }

  return (
    <main
      data-sanity={createDataAttribute({
        ...createDataAttributeConfig,
        id: documentId,
        type: documentType,
        path: 'content',
      }).toString()}
      className="w-full flex justify-center flex-col"
    >
      {blocks.map((block) => {
        const Component =
          blockComponents[block._type as keyof typeof blockComponents];
        if (!Component) {
          return <>Something went wrong</>;
        }
        return (
          <DragHandle
            key={block._key}
            block={block}
            documentId={documentId}
            documentType={documentType}
          >
            {/* @ts-expect-error sanity */}
            <Component {...block} />
          </DragHandle>
        );
      })}
    </main>
  );
}
