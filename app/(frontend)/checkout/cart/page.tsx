import Image from 'next/image';
import { Plus } from '@shared/ui/PlusIcon';
import { Minus } from '@shared/ui/MinusIcon';
import { X } from '@shared/ui/XIcon';

const imgImage =
  'http://localhost:3845/assets/70700547a3c52992a7c7459300799a1d70a5c3bf.png';
const imgImage1 =
  'http://localhost:3845/assets/2c3db05bfdeccc61f979c19b452140ebacdc963b.png';

export default function CartPage() {
  return (
    <div className="content-stretch flex flex-col gap-[51px] items-start px-[121px] py-[50px] relative size-full">
      <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[28px] not-italic relative shrink-0 text-[22px] text-black text-center w-full">
        Shopping Bag
      </p>
      <div className="content-stretch flex gap-[114px] items-start relative shrink-0 w-full">
        <div className="basis-0 content-stretch flex gap-[20px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className="basis-0 border border-[#ddd] border-solid content-stretch flex flex-col gap-[24px] grow items-center min-h-px min-w-px px-[23px] py-[8px] relative shrink-0">
            <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[10px] items-center not-italic relative shrink-0 text-center w-full">
              <p className="leading-[24px] relative shrink-0 text-[18px] text-black w-full">
                Alpaca Wool Crewneck Sweater
              </p>
              <p className="leading-[20px] relative shrink-0 text-[#6a6a6a] text-[11px] w-full">
                Beige
              </p>
            </div>
            <div className="h-[236.147px] relative shrink-0 w-[198px]">
              <Image
                alt="Alpaca Wool Crewneck Sweater"
                className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                src={imgImage}
                width={198}
                height={236}
              />
            </div>
            <div className="border border-[#ddd] border-solid content-stretch flex gap-[4px] items-center justify-center px-[8px] py-[2px] relative rounded-[30px] shrink-0 w-[78px]">
              <Minus className="overflow-clip relative shrink-0 size-[14px]" />
              <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black text-center">
                1
              </p>
              <Plus className="overflow-clip relative shrink-0 size-[14px]" />
            </div>
            <div className="border-[#ddd] border-[1px_0px_0px] border-solid content-stretch flex font-['Styrene_A_Web:Regular',sans-serif] items-start justify-between leading-[20px] not-italic px-0 py-[13px] relative shrink-0 text-[#6a6a6a] text-[13px] w-full">
              <p className="relative shrink-0 w-[76px]">Subtotal</p>
              <p className="relative shrink-0 text-right w-[76px]">$248</p>
            </div>
            <div className="absolute overflow-clip right-[8.5px] size-[14px] top-[8px]">
              <X className="overflow-clip relative shrink-0 size-[14px]" />
            </div>
          </div>
          <div className="basis-0 border border-[#ddd] border-solid content-stretch flex flex-col gap-[24px] grow items-center min-h-px min-w-px px-[23px] py-[8px] relative shrink-0">
            <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[10px] items-center not-italic relative shrink-0 text-center w-full">
              <p className="leading-[24px] relative shrink-0 text-[18px] text-black w-full">
                Single Origin Cashmere Crop...
              </p>
              <p className="leading-[20px] relative shrink-0 text-[#6a6a6a] text-[11px] w-full">
                Apricot / Large
              </p>
            </div>
            <div className="h-[236px] relative shrink-0 w-[198px]">
              <Image
                alt="Single Origin Cashmere Crop..."
                className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                src={imgImage1}
                width={198}
                height={236}
              />
            </div>
            <div className="border border-[#ddd] border-solid content-stretch flex gap-[4px] items-center justify-center px-[8px] py-[2px] relative rounded-[30px] shrink-0 w-[78px]">
              <Minus className="overflow-clip relative shrink-0 size-[14px]" />
              <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black text-center">
                1
              </p>
              <Plus className="overflow-clip relative shrink-0 size-[14px]" />
            </div>
            <div className="border-[#ddd] border-[1px_0px_0px] border-solid content-stretch flex font-['Styrene_A_Web:Regular',sans-serif] items-start justify-between leading-[20px] not-italic px-0 py-[13px] relative shrink-0 text-[#6a6a6a] text-[13px] w-full">
              <p className="relative shrink-0 w-[76px]">Subtotal</p>
              <p className="relative shrink-0 text-right w-[76px]">$298</p>
            </div>
            <div className="absolute overflow-clip right-[9px] size-[14px] top-[8px]">
              <X className="overflow-clip relative shrink-0 size-[14px]" />
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0 w-[295px]">
          <div className="border border-[#ddd] border-solid content-stretch flex flex-col gap-px items-start relative rounded-[4px] shrink-0 w-full">
            <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex items-center justify-center p-[13px] relative shrink-0 w-full">
              <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black text-center">
                Order Summary
              </p>
            </div>
            <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex font-['Styrene_A_Web:Regular',sans-serif] items-center justify-between leading-[20px] not-italic p-[13px] relative shrink-0 text-[13px] text-black w-full">
              <p className="basis-0 grow min-h-px min-w-px relative shrink-0">
                Subtotal
              </p>
              <p className="basis-0 grow min-h-px min-w-px relative shrink-0 text-right">
                $396
              </p>
            </div>
            <div className="content-stretch flex font-['Styrene_A_Web:Regular',sans-serif] items-center justify-between leading-[20px] not-italic p-[13px] relative shrink-0 text-[13px] text-black w-full">
              <p className="basis-0 grow min-h-px min-w-px relative shrink-0">
                Bag Total
              </p>
              <p className="basis-0 grow min-h-px min-w-px relative shrink-0 text-right">
                dsfg$396dfg
              </p>
            </div>
          </div>
          <div className="border border-[#ddd] border-solid content-stretch flex flex-col gap-[12px] items-start p-[13px] relative rounded-[4px] shrink-0 w-full">
            <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
              Add a gift message to your order
            </p>
            <div className="border border-[#ddd] border-solid h-[89px] shrink-0 w-full" />
          </div>
          <div className="content-stretch flex flex-col gap-[18px] items-start relative shrink-0 w-full">
            <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6a6a6a] text-[13px] w-full">{`Shipping & taxes calculated at checkout`}</p>
            <div className="bg-black content-stretch flex items-center justify-center px-[18px] py-[11px] relative shrink-0 w-full">
              <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
                Go To Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
