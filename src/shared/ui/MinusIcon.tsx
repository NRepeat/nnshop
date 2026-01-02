const imgPlus =
  'http://localhost:3845/assets/2ebf1b4d037f823ffce000f6c3337e8e5e87221b.svg';
const imgVector =
  'http://localhost:3845/assets/0ad84cb61f56e2b5034cc6b47625dbbc705e6a14.svg';

export function Minus({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgPlus} />
      <div className="absolute bottom-1/2 left-[15.63%] right-[15.63%] top-1/2">
        <div className="absolute inset-[-0.5px_-3.03%]">
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    </div>
  );
}
