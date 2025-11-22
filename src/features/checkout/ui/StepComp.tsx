import clsx from 'clsx';
import Link from 'next/link';

export const StepComp = ({
  slug,
  link,
  isActive,
  isCompleted,
}: {
  slug: string;
  link: string;
  isActive: boolean;
  isCompleted?: boolean;
}) => {
  return (
    <Link
      href={link}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#325039] focus:ring-offset-2',
        isActive
          ? 'bg-[#325039] text-white shadow-md'
          : isCompleted
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-white text-gray-600 border border-gray-200',
      )}
    >
      <div
        className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
          isActive
            ? 'bg-white text-[#325039]'
            : isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-600',
        )}
      >
        {isCompleted ? '✓' : slug.charAt(0).toUpperCase()}
      </div>
      <span className="hidden sm:inline capitalize">{slug}</span>
    </Link>
  );
};
