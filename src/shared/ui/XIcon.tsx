const imgX =
  'http://localhost:3845/assets/2ebf1b4d037f823ffce000f6c3337e8e5e87221b.svg';
const imgVector =
  'http://localhost:3845/assets/0d64611fb82370ff6927e1e0ae730817a3907250.svg';
const imgVector1 =
  'http://localhost:3845/assets/368d1316140c9f805b9affb7423360fec256886f.svg';

export function X({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgX} />
      <div className="absolute inset-[21.88%]">
        <div className="absolute inset-[-3.7%]">
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
      <div className="absolute inset-[21.88%]">
        <div className="absolute inset-[-3.7%]">
          <img alt="" className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
    </div>
  );
}
