import { Aguafina_Script } from 'next/font/google';

const kings = Aguafina_Script({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-bilbo',
});
const Receipt = async ({
  isSuccess,
  orderId,
}: {
  isSuccess?: boolean;
  orderId?: string;
}) => {
  return <>rrr</>;
};
export default Receipt;
