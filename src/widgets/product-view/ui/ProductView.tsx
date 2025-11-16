import Gallery from '@features/product/ui/Gallery';
import Description from '@features/product/ui/Description';
import { Product } from '@shared/types/product/types';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';

export function ProductView({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: any | undefined;
}) {
  if (!product) throw new Error('Product not found');
  // const [selectedOptions, setSelectedOptions] = useState<
  //   Record<string, string>
  // >(() => {
  //   const variantId = searchParams.get('variant');
  //   const variantFromUrl = product.variants.edges.find(
  //     (edge: any) => edge.node.id === variantId,
  //   )?.node;

  //   const initialOptions: Record<string, string> = {};
  //   const optionsSource = variantFromUrl
  //     ? variantFromUrl.selectedOptions
  //     : product.variants.edges[0]?.node.selectedOptions;

  //   if (optionsSource) {
  //     optionsSource.forEach((opt: any) => {
  //       initialOptions[opt.name] = opt.value;
  //     });
  //   } else {
  //     product.options.forEach((option: any) => {
  //       if (option.values.length > 0) {
  //         initialOptions[option.name] = option.values[0];
  //       }
  //     });
  //   }
  //   return initialOptions;
  // });

  // const selectedVariant = useMemo(() => {
  //   return product.variants.edges.find((edge: any) => {
  //     return edge.node.selectedOptions.every((opt: any) => {
  //       return selectedOptions[opt.name] === opt.value;
  //     });
  //   })?.node;
  // }, [selectedOptions, product.variants.edges]);

  // const handleOptionChange = useCallback(
  //   (name: string, value: string) => {
  //     const newOptions = { ...selectedOptions, [name]: value };
  //     setSelectedOptions(newOptions);
  //   },
  //   [selectedOptions],
  // );

  const images =
    product.images?.edges?.length > 0
      ? product.images.edges
      : product.featuredImage
        ? [{ node: product.featuredImage }]
        : [];

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <Gallery images={images} selectedVariant={selectedVariant} />
        <Description product={product} selectedVariant={selectedVariant} />
      </div>
    </div>
  );
}
