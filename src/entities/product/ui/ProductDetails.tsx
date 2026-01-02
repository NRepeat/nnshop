export const ProductDetails = ({ details }: { details: any[] }) => {
  return (
    <div className="border-[#ddd] border-y border-solid content-stretch flex gap-[72px] items-start px-[115px] py-[67px] w-full">
      {details?.map((detail: any) => (
        <div
          key={detail._key}
          className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0"
        >
          <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
            {detail.title}
          </p>
          <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
            <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
              {detail.heading}
            </p>
            <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
              {detail.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
