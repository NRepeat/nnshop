import { X } from '@shared/ui/XIcon';

const imgImage =
  'http://localhost:3845/assets/d60713991b38131e537fd36320aa7d603a802dbc.png';

export default function PromotionPopUp() {
  return (
    <div className="bg-[#f5f4f4] content-stretch flex items-start relative shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] w-full">
      <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImage}
        />
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[48px] grow h-full items-end min-h-px min-w-px p-[15px] relative shrink-0">
        <X className="overflow-clip relative shrink-0 size-[24px]" />
        <div className="content-stretch flex flex-col gap-[32px] items-center px-[40px] py-0 relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[20px] items-center relative shrink-0 w-full">
            <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-center w-full">
              Enter your email to unlock
            </p>
            <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[13px] items-center not-italic relative shrink-0 text-black text-center w-full">
              <p className="leading-[32px] relative shrink-0 text-[24px] w-full">
                15% off your first order
              </p>
              <div className="leading-[20px] relative shrink-0 text-[13px] w-full">
                <p className="mb-0">Plus, get insider access to promotions,</p>
                <p>launches, events, and more.</p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[18px] items-center relative shrink-0 w-full">
              <div className="border border-[#d3d4d5] border-solid content-stretch flex items-center px-[14px] py-[12px] relative shrink-0 w-full">
                <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#565656] text-[13px]">
                  Enter your email address
                </p>
              </div>
              <div className="bg-black content-stretch flex items-center justify-center px-[18px] py-[11px] relative shrink-0">
                <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
                  Unlock Access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
