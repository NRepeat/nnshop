'use client';
import { Button } from '@shared/ui/button';
import Image from 'next/image';

interface SdkButtonProps {
  label?: string;
  onClick?: () => void;
}

const SdkButton: React.FC<SdkButtonProps> = ({
  label = 'Pay with LiqPay',
  onClick,
}) => {
  return (
    <Button
      type="submit"
      className="w-full h-12 bg-green-800"
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
    </Button>
  );
};

export default SdkButton;
