import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

interface SdkButtonProps {
  label?: string;
  color?: string;
  background?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  onClick?: () => void;
  className?: string;
}

const SdkButton: React.FC<SdkButtonProps> = ({
  label = 'Pay with LiqPay',
  onClick,
  className = '',
}) => {
  return (
    <button
      type="submit"
      className={clsx(
        className,
        'w-full h-14 bg-[#325039] hover:bg-[#2a4330] text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Image
            src="https://static.liqpay.ua/buttons/logo-white.svg"
            alt="LiqPay"
            width={24}
            height={24}
            className="filter brightness-0 invert"
          />
        </div>
        <span className="text-white font-semibold">{label}</span>
      </div>
    </button>
  );
};

export default SdkButton;
