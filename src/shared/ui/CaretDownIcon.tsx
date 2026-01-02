const imgCaretDown =
  'http://localhost:3845/assets/2ebf1b4d037f823ffce000f6c3337e8e5e87221b.svg';
const imgVector =
  'http://localhost:3845/assets/9d8694519d22fdb942473bb6bb3d1f5e4e9efe43.svg';

export function CaretDown({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgCaretDown} />
      <div className="absolute inset-[37.5%_18.75%_31.25%_18.75%]">
        <div className="absolute inset-[-6.67%_-3.33%]">
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    </div>
  );
}
