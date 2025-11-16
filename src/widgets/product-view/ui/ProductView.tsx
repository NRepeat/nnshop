'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Bookmark, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/shared/lib/utils';

type Product = any;

const ConditionScale = () => {
  const conditions = ['Fair', 'Good', 'Great', 'Excellent', 'Pristine'];
  const currentCondition = 'Great';

  return (
    <div className="w-full mt-4">
      <div className="relative flex items-center justify-between w-full px-2">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
        {conditions.map((condition) => (
          <div
            key={condition}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className={cn(
                'w-3.5 h-3.5 rounded-full bg-white border-2',
                currentCondition === condition
                  ? 'border-black bg-black'
                  : 'border-gray-300',
              )}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between w-full mt-2 text-xs text-muted-foreground">
        {conditions.map((condition) => (
          <span
            key={condition}
            className={cn(
              'w-1/5 text-center',
              currentCondition === condition && 'font-bold text-black',
            )}
          >
            {condition}
          </span>
        ))}
      </div>
    </div>
  );
};

export function ProductView({ product }: { product: Product }) {
  const t = useTranslations('ProductPage');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const variantId = searchParams.get('variant');
    const variantFromUrl = product.variants.edges.find(
      (edge: any) => edge.node.id === variantId,
    )?.node;

    const initialOptions: Record<string, string> = {};
    const optionsSource = variantFromUrl
      ? variantFromUrl.selectedOptions
      : product.variants.edges[0]?.node.selectedOptions;

    if (optionsSource) {
      optionsSource.forEach((opt: any) => {
        initialOptions[opt.name] = opt.value;
      });
    } else {
      product.options.forEach((option: any) => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0];
        }
      });
    }
    return initialOptions;
  });

  const selectedVariant = useMemo(() => {
    return product.variants.edges.find((edge: any) => {
      return edge.node.selectedOptions.every((opt: any) => {
        return selectedOptions[opt.name] === opt.value;
      });
    })?.node;
  }, [selectedOptions, product.variants.edges]);

  const handleOptionChange = useCallback(
    (name: string, value: string) => {
      const newOptions = { ...selectedOptions, [name]: value };
      setSelectedOptions(newOptions);
    },
    [selectedOptions],
  );

  useEffect(() => {
    if (!mainApi) return;
    const onSelect = (api: CarouselApi) => {
      setSelectedIndex(api.selectedScrollSnap());
      if (thumbApi) {
        thumbApi.scrollTo(api.selectedScrollSnap());
      }
    };
    mainApi.on('select', onSelect);
    onSelect(mainApi); // Set initial state
    return () => {
      mainApi.off('select', onSelect);
    };
  }, [mainApi, thumbApi]);

  const onThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
    },
    [mainApi],
  );

  useEffect(() => {
    const currentVariantId = searchParams.get('variant');

    if (selectedVariant && selectedVariant.id !== currentVariantId) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('variant', selectedVariant.id);
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  }, [selectedVariant, searchParams, pathname, router]);

  const images =
    product.images?.edges?.length > 0
      ? product.images.edges
      : product.featuredImage
        ? [{ node: product.featuredImage }]
        : [];
  const price = selectedVariant?.price || product.priceRange?.maxVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isDiscounted = compareAtPrice && compareAtPrice.amount > price.amount;

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <div className="relative">
            <Carousel setApi={setMainApi}>
              <CarouselContent>
                {images.map((image: any, index: number) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[4/5] relative">
                      <Image
                        src={image.node.url}
                        alt={image.node.altText || product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/50 backdrop-blur-sm"
              >
                <Bookmark className="h-6 w-6" />
              </Button>
            </div>
          </div>
          {images.length > 1 && (
            <Carousel
              setApi={setThumbApi}
              opts={{ containScroll: 'keepSnaps', dragFree: true }}
              className="mt-4"
            >
              <CarouselContent className="-ml-2">
                {images.map((image: any, index: number) => (
                  <CarouselItem
                    key={index}
                    onClick={() => onThumbClick(index)}
                    className="basis-1/4 pl-2 cursor-pointer"
                  >
                    <div
                      className={cn(
                        'aspect-square relative border rounded-md overflow-hidden',
                        index === selectedIndex
                          ? 'border-primary'
                          : 'border-transparent opacity-50',
                      )}
                    >
                      <Image
                        src={image.node.url}
                        alt={image.node.altText || product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="sticky top-24">
            <h4>
              <a href="#" className="tw:no-underline tw:text-inherit text-md">
                {product.vendor}
              </a>
            </h4>
            <div className="product__title mt-1">
              <h1 className="text-2xl font-bold">{product.title}</h1>
            </div>

            <div id="price" role="status" className="mt-4">
              <div className="flex items-baseline gap-3">
                {price && (
                  <p
                    className={`text-xl font-semibold ${isDiscounted ? 'text-destructive' : ''}`}
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: price.currencyCode,
                    }).format(price.amount)}
                  </p>
                )}
                {isDiscounted && compareAtPrice && (
                  <p className="text-lg text-muted-foreground line-through">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: compareAtPrice.currencyCode,
                    }).format(compareAtPrice.amount)}
                  </p>
                )}
              </div>
            </div>

            {price && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  From ${(price.amount / 12).toFixed(2)}/mo with{' '}
                  <span className="font-bold">Shop Pay</span>
                </p>
              </div>
            )}

            <form className="mt-6">
              <div className="mt-6 space-y-4">
                {product.options.map(
                  (option: any) =>
                    option.name === 'Color' &&
                    option.values.length > 1 && (
                      <div key={option.id}>
                        <Label className="text-sm font-medium">
                          {option.name}
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {option.values.map((value: string) => (
                            <Button
                              key={value}
                              variant={
                                selectedOptions[option.name] === value
                                  ? 'default'
                                  : 'outline'
                              }
                              onClick={() =>
                                handleOptionChange(option.name, value)
                              }
                              className="rounded-full px-4 py-2"
                            >
                              {value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>

              <div className="product-form__buttons mt-8">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-md rounded-full"
                  disabled={!selectedVariant?.availableForSale}
                  onClick={(e) => e.preventDefault()}
                >
                  {selectedVariant?.availableForSale
                    ? t('addToCart')
                    : t('soldOut')}
                </Button>
              </div>
            </form>

            {product.descriptionHtml && (
              <div className="product__description rte quick-add-hidden mt-8">
                <div
                  className="prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Product Condition</h3>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="condition mt-2 text-sm">
                <p className="font-bold">Great Overall Condition</p>
                <p className="text-muted-foreground">
                  Great condition with cut tags. Please review all pictures for
                  details.
                </p>
              </div>
              <ConditionScale />
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Guaranteed Authenticity</h3>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Every item is rigorously authenticated by our experts, familiar
                in the specifics of each brand featured on Justin Reed. All
                photos are of the actual product you will receive. We are
                confident in our processes and stand behind the authenticity of
                each item sold.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
