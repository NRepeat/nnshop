const imgCaretRight =
  'http://localhost:3845/assets/2ebf1b4d037f823ffce000f6c3337e8e5e87221b.svg';
const imgVector =
  'http://localhost:3845/assets/8ac6077e79674d016650828f0965bd540b3c7cca.svg';
const imgVector1 =
  'http://localhost:3845/assets/24835f795af593bcb72dd599c0f2c92511161ef4.svg';
const imgVector2 =
  'http://localhost:3845/assets/1a31e3f638ca39b3c2341232b2b468a1fd8e59f4.svg';
const imgVector3 =
  'http://localhost:3845/assets/2215816e35368166f27757af10c8e82525fbe42a.svg';

function CaretRight({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgCaretRight} />
      <div className="absolute inset-[18.75%_31.25%_18.75%_37.5%]">
        <div className="absolute inset-[-3.33%_-6.67%]">
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    </div>
  );
}

function CaretLeft({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgCaretRight} />
      <div className="absolute inset-[18.75%_37.5%_18.75%_31.25%]">
        <div className="absolute inset-[-3.33%_-6.67%]">
          <img alt="" className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgCaretRight} />
      <div className="absolute inset-[6.25%_6.21%_9.38%_6.23%]">
        <img alt="" className="block max-w-none size-full" src={imgVector2} />
      </div>
    </div>
  );
}

function StarHalf({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgCaretRight} />
      <div className="absolute inset-[6.25%_6.25%_9.38%_6.23%]">
        <img alt="" className="block max-w-none size-full" src={imgVector3} />
      </div>
    </div>
  );
}

export default function ProductComments() {
  return (
    <div className="content-stretch flex flex-col gap-px items-start pb-0 pt-[140px] px-[32px] relative w-full">
      <div className="content-stretch flex flex-col items-start pb-[40px] pt-0 px-0 relative shrink-0 w-full">
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[28px] not-italic relative shrink-0 text-[22px] text-black text-nowrap">
            4.4
          </p>
          <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
            <Star className="overflow-clip relative shrink-0 size-[12px]" />
            <Star className="overflow-clip relative shrink-0 size-[12px]" />
            <Star className="overflow-clip relative shrink-0 size-[12px]" />
            <Star className="overflow-clip relative shrink-0 size-[12px]" />
            <StarHalf className="overflow-clip relative shrink-0 size-[12px]" />
          </div>
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] min-w-full not-italic relative shrink-0 text-[13px] text-black w-[min-content]">
          Based on 14 reviews
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[49px] items-start px-0 py-[40px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] items-start not-italic relative shrink-0 w-[250px]">
          <p className="leading-[22px] relative shrink-0 text-[16px] text-black w-full">
            Alayne A.
          </p>
          <p className="leading-[20px] relative shrink-0 text-[#979797] text-[11px] w-full">
            Verified Buyer
          </p>
        </div>
        <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
            </div>
            <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[15px] text-black">
              Perfect Essential!
            </p>
          </div>
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
            This is an amazing staple for my wardrobe. So soft and effortless,
            lightweight but warm.
          </p>
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-right w-[250px]">
          01/12/24
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[49px] items-start px-0 py-[40px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] items-start not-italic relative shrink-0 w-[250px]">
          <p className="leading-[22px] relative shrink-0 text-[16px] text-black w-full">
            Cynthia V.
          </p>
          <p className="leading-[20px] relative shrink-0 text-[#979797] text-[11px] w-full">
            Verified Buyer
          </p>
        </div>
        <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
            </div>
            <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[15px] text-black">
              Chic and edgy
            </p>
          </div>
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">{`Beautiful sweater - the funnel neck lays elegantly. The material is very soft and the length hits around upper thigh as a 5'5" person. Most recently I paired it with a black leather mini skirt, black tights, and boots. Love it!`}</p>
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-right w-[250px]">
          12/29/23
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[49px] items-start px-0 py-[40px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] items-start not-italic relative shrink-0 w-[250px]">
          <p className="leading-[22px] relative shrink-0 text-[16px] text-black w-full">
            catherine...
          </p>
          <p className="leading-[20px] relative shrink-0 text-[#979797] text-[11px] w-full">
            Verified Buyer
          </p>
        </div>
        <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
            </div>
            <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[15px] text-black">
              Ma favorite sweater
            </p>
          </div>
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
            It’s actually my second one because I like it so much : funnel neck
            is very flattering and comfortable, the length is just right and it
            falls nicely on pants or skirts.read more about review content It’s
            actually my second one because
          </p>
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-right w-[250px]">
          11/14/23
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[49px] items-start px-0 py-[40px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] items-start not-italic relative shrink-0 w-[250px]">
          <p className="leading-[22px] relative shrink-0 text-[16px] text-black w-full">
            Jin Y.
          </p>
          <p className="leading-[20px] relative shrink-0 text-[#979797] text-[11px] w-full">
            Verified Buyer
          </p>
        </div>
        <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
            </div>
            <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[15px] text-black">
              The texture and color are
            </p>
          </div>
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
            The texture and color are lovely.read more about review content
          </p>
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-right w-[250px]">
          01/10/23
        </p>
      </div>
      <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[49px] items-start px-0 py-[40px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] items-start not-italic relative shrink-0 w-[250px]">
          <p className="leading-[22px] relative shrink-0 text-[16px] text-black w-full">
            Julian K.
          </p>
          <p className="leading-[20px] relative shrink-0 text-[#979797] text-[11px] w-full">
            Verified Buyer
          </p>
        </div>
        <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
              <Star className="overflow-clip relative shrink-0 size-[12px]" />
            </div>
            <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[15px] text-black">
              Purchased as a Christmas gift
            </p>
          </div>
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
            Purchased as a Christmas gift for my mother who loves it. She
            particularly likes the seam along the back with the small round
            metal tag as an elegant accent.
          </p>
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-right w-[250px]">
          01/03/23
        </p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center justify-center px-0 py-[45px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col h-[30px] items-center justify-center px-[6px] py-[5px] relative rounded-[5px] shrink-0">
          <CaretLeft className="overflow-clip relative shrink-0 size-[12px]" />
        </div>
        <div className="bg-black content-stretch flex flex-col items-center justify-center px-[9px] py-[5px] relative rounded-[5px] shrink-0">
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-center text-nowrap text-white">
            1
          </p>
        </div>
        <div className="content-stretch flex flex-col items-center justify-center px-[9px] py-[5px] relative rounded-[5px] shrink-0">
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-center text-nowrap">
            2
          </p>
        </div>
        <div className="content-stretch flex flex-col items-center justify-center px-[9px] py-[5px] relative rounded-[5px] shrink-0">
          <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-center text-nowrap">
            3
          </p>
        </div>
        <div className="content-stretch flex flex-col h-[30px] items-center justify-center px-[6px] py-[5px] relative rounded-[5px] shrink-0">
          <CaretRight className="overflow-clip relative shrink-0 size-[12px]" />
        </div>
      </div>
    </div>
  );
}
