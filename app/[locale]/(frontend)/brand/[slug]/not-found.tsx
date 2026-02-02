import { Button } from '@shared/ui/button';
import Link from 'next/link';

export default function BrandNotFound() {
  return (
    <div className="container  py-20 text-center min-h-screen h-fit flex flex-col justify-center items-center">
      <div className="h-full flex flex-col justify-center items-center pb-[25vh]">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Бренд не знайдено</p>
        <div className="flex gap-4 justify-center">
          {/* <Link href="/brands">
            <Button variant="default">Всі бренди</Button>
          </Link> */}
          <Link href="/">
            <Button variant="outline">На головну</Button>
          </Link>
        </div>
      </div>
    </div>    
  );
}
