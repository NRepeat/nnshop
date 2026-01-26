import { Provider } from '@/app/providers/authUIProvider';

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className=" flex-col items-center justify-center flex w-full ">
        <Provider> {children}</Provider>
      </div>
    </>
  );
}
