import { createDataAttribute } from 'next-sanity';
import { createDataAttributeConfig } from '../lib/createDataAttributeConfig';

export const DragHandle = ({
  children,
  block,
  documentId,
  documentType,
}: {
  children: React.ReactNode;
  block: { _key: string };
  documentId: string;
  documentType: string;
}) => (
  <div
    data-sanity={createDataAttribute({
      ...createDataAttributeConfig,
      id: documentId,
      type: documentType,
      path: `content[_key==\"${block._key}\"]`,
    }).toString()}
  >
    {children}
  </div>
);
