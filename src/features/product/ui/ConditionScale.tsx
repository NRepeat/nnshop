import { cn } from '@shared/lib/utils';

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
export default ConditionScale;
