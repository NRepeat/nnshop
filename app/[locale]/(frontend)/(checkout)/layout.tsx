import { ScrollToTop } from "@shared/ui/ScrollToTop";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>
  <ScrollToTop/>
  {children}</>;
}
