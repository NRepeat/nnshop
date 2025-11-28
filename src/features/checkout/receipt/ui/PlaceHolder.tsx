import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import PlaceHolderLine from '@shared/assets/PlaceHolderLine';

export const PlaceHolder = ({
  children,
  toolTipDescription,
}: {
  children: React.ReactNode;
  toolTipDescription: string;
}) => {
  return (
    <div className="flex justify-start p-2.5 w-full  gap-2   ">
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{toolTipDescription}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex flex-col text-start justify-evenly py-4  w-full">
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
      </div>
    </div>
  );
};
