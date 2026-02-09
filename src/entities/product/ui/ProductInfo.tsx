import {
  ProductVariant,
  Product as ShopifyProduct,
} from '@shared/lib/shopify/types/storefront.types';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';
import { COLOR_MAP } from '@widgets/product-view/ui/collors';
import { cn } from '@shared/lib/utils';



export const ProductInfo = ({
  product,
  selectedVariant,
  colorOptions,
  sizeOptions,
}: {
  product: ShopifyProduct;
  selectedVariant: ProductVariant | undefined;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
}) => (
  <div className="content-stretch flex flex-col gap-[30px] items-start px-[50px] py-0 relative w-full">
    <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#979797] text-[13px] w-full">
      Shop / Clothing
    </p>
    <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[8px] items-start not-italic relative shrink-0 text-black w-full">
      <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
        {product.title}
      </p>
      <p className="leading-[22px] relative shrink-0 text-[16px] w-full">
        {product.priceRange?.maxVariantPrice.currencyCode}
        {Number(product.priceRange?.maxVariantPrice.amount).toFixed(0)}
      </p>
    </div>
    <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
      {product.description}
    </p>
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-[2px] items-start leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
        <p className="font-['Styrene_A_Web:Medium',sans-serif] relative shrink-0 text-nowrap">
          Product Color:
        </p>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] relative shrink-0 w-[66px]">
          {selectedVariant?.title.split(' / ')[1]}
        </p>
      </div>
      <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#565656] text-[13px] w-full">
        Color
      </p>
      <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full">
        {colorOptions &&
          colorOptions.map((color: string) => (
            <div className="relative shrink-0 size-[32px]" key={color}>
              <div
                className={cn(
                        'absolute inset-[10%]',
                        COLOR_MAP[color] || 'bg-gray-200',
                      )}
              ></div>
              <div className="absolute inset-[-1.56%]">
                <img
                  alt=""
                  className="block max-w-none size-full"
                  src="http://localhost:3845/assets/7b6e69fa820e8157eb187c09e4e2076f8a5db102.svg"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="content-stretch flex items-start justify-between leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-nowrap w-full">
        <p className="font-['Styrene_A_Web:Medium',sans-serif] relative shrink-0">
          Product Size:
        </p>
        <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Styrene_A_Web:Regular',sans-serif] relative shrink-0 text-right underline">
          Size Chart
        </p>
      </div>
      <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full">
        {sizeOptions &&
          sizeOptions.map((size: string) => (
            <div
              className="border border-[#ddd] border-solid content-stretch flex flex-col h-[38px] items-center justify-center relative shrink-0 w-[36px]"
              key={size}
            >
              <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-center text-nowrap">
                {size}
              </p>
            </div>
          ))}
      </div>
    </div>
    <AddToCartButton product={product} />
    {/*<div className="bg-black content-stretch flex items-center justify-center px-[18px] py-[11px] relative shrink-0 w-full">
      <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
        Add to Bag
      </p>
    </div>*/}
    <div className="content-stretch flex flex-col gap-px items-start relative shrink-0 w-full">
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
        <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
          Check In-Store Availability
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
        <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
          Fit Details
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
        <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">{`Fabrication & Care`}</p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
        <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">{`Shipping & Returns`}</p>
      </div>
    </div>
  </div>
);
