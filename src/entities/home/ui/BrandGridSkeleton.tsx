export function BrandGridSkeleton() {
  return (
    <div className="container animate-pulse">
      <div className="py-8">
        <div className="hidden md:grid grid-cols-5 gap-x-4 gap-y-4 items-center justify-items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[160px] h-[100px] bg-gray-200 rounded" />
          ))}
        </div>
        <div className="flex md:hidden gap-8 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="basis-1/3 shrink-0 flex flex-col gap-8">
              <div className="h-16 w-full max-w-[160px] mx-auto bg-gray-200 rounded" />
              <div className="h-16 w-full max-w-[160px] mx-auto bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
