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
    <div className="flex items-center gap-3 p-3 w-full rounded-lg border border-dashed border-gray-200">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="shrink-0 text-gray-300">{children}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{toolTipDescription}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex flex-col justify-evenly gap-1.5 w-full">
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
      </div>
    </div>
  );
};
