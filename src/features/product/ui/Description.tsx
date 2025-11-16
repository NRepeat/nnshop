import { Separator } from '@shared/ui/separator';
import ConditionScale from './ConditionScale';
import { HelpCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Product } from '@shared/types/product/types';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Label } from '@shared/ui/label';
import Option from './Option';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import addToCart from '../api/add-to-cart';

const Description = async ({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: ProductVariant;
}) => {
  if (!product) return notFound();
  const t = await getTranslations('ProductPage');
  const price = product.priceRange?.maxVariantPrice;
  const isDiscounted = false;
  const compareAtPrice = product.priceRange?.maxVariantPrice;
  const selectedOption = selectedVariant
    ? selectedVariant?.selectedOptions.find((option) => option.name === 'Color')
        ?.value
    : '';
  // const isDiscounted = compareAtPrice && compareAtPrice.amount > price.amount;
  console.log(selectedOption);
  const handleSubmit = async () => {
    'use server';
    console.log('Submit');
  };
  return (
    <div className="md:col-span-4 flex jusify-center flex-col w-full items-center">
      <div className="sticky top-24 md:max-w-xl ">
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
              {t('fromMoWith', { price: `${(price.amount / 12).toFixed(2)}` })}{' '}
              <span className="font-bold">{t('shopPay')}</span>
            </p>
          </div>
        )}
        <form className="mt-6" action={addToCart}>
          <Option product={product} selectedOption={selectedOption} />
          <input
            type="hidden"
            name="variantId"
            value={
              selectedVariant
                ? selectedVariant.id
                : product.variants.edges[0].node.id
            }
          />
          <div className="product-form__buttons mt-8">
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-md rounded-full"
              disabled={!selectedVariant?.availableForSale}
            >
              {t('addToCart')}
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
            <h3 className="font-semibold">{t('productCondition')}</h3>

            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="condition mt-2 text-sm">
            <p className="font-bold">{t('greatOverallCondition')}</p>

            <p className="text-muted-foreground">{t('conditionDetails')}</p>
          </div>

          <ConditionScale />
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{t('guaranteedAuthenticity')}</h3>

            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            {t('authenticityDetails')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Description;
