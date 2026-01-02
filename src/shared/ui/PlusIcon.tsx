const imgPlus =
  'http://localhost:3845/assets/2ebf1b4d037f823ffce000f6c3337e8e5e87221b.svg';
const imgVector =
  'http://localhost:3845/assets/0ad84cb61f56e2b5034cc6b47625dbbc705e6a14.svg';
const imgVector1 =
  'http://localhost:3845/assets/3c0a5f7e5b9875b25f4bae4e6ef6973fc8b39a30.svg';

export function Plus({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgPlus} />
      <div className="absolute bottom-1/2 left-[15.63%] right-[15.63%] top-1/2">
        <div className="absolute inset-[-0.5px_-3.03%]">
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
      <div className="absolute bottom-[15.63%] left-1/2 right-1/2 top-[15.63%]">
        <div className="absolute inset-[-3.03%_-0.5px]">
          <img alt="" className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
    </div>
  );
}
