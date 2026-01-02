const imgX =
  'http://localhost:3845/assets/a76299ff6c15179db0f91ca0f9d2980608be66eb.svg';
const img =
  'http://localhost:3845/assets/1a7007a0868ff4274798da11f665b79c933eac98.svg';
const img1 =
  'http://localhost:3845/assets/66b2e69d2993f1daac00bb9a574c7432e7c0c824.svg';

export function X({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgX} />
      <div className="absolute inset-[21.88%]">
        <div
          className="absolute inset-[-6.35%]"
          style={{
            '--fill-0': 'rgba(106, 106, 106, 1)',
            '--stroke-0': 'rgba(106, 106, 106, 1)',
          }}
        >
          <img alt="" className="block max-w-none size-full" src={img} />
        </div>
      </div>
      <div className="absolute inset-[21.88%]">
        <div
          className="absolute inset-[-6.35%]"
          style={{
            '--fill-0': 'rgba(106, 106, 106, 1)',
            '--stroke-0': 'rgba(106, 106, 106, 1)',
          }}
        >
          <img alt="" className="block max-w-none size-full" src={img1} />
        </div>
      </div>
    </div>
  );
}
