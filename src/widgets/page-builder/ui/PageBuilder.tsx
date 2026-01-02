import { PAGE_QUERYResult } from '@shared/sanity/types';
import { ProductDetails } from '@entities/product/ui/ProductDetails';
import { ElegantEase } from '@entities/product/ui/ElegantEase';
import { ProductComments } from '@entities/product/ui/ProductComments';

const blockComponents = {
  productDetails: (props: any) => <ProductDetails {...props} />,
  elegantEase: (props: any) => <ElegantEase {...props} />,
  productComments: (props: any) => <ProductComments {...props} />,
  // other blocks...
};

type Props = {
  content: PAGE_QUERYResult['content'];
};

export const PageBuilder = ({ content }: Props) => {
  if (!content) {
    return null;
  }
  return (
    <>
      {content.map((block) => {
        const Component = blockComponents[block._type];
        if (!Component) {
          return <div key={block._key}>Unknown block type: {block._type}</div>;
        }
        return <Component key={block._key} {...block} />;
      })}
    </>
  );
};
