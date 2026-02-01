'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@shared/lib/utils';
import { CrossedLine } from '@shared/ui/crossed-line';
import { compareSizes } from '@shared/lib/sort-sizes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { createQuickOrder } from '../api/create-quick-order';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
export const isValidPhone = (phone: string) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber?.isValid() || false;
  } catch {
    return false;
  }
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать не менее 2 символов.',
  }),
  phone: z.string().refine(isValidPhone, {
    message: 'Введите корректный номер телефона.',
  }),
});

interface QuickBuyModalProps {
  product: ShopifyProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizeOptions: string[] | undefined;
}

export const QuickBuyModal = ({
  product,
  open,
  onOpenChange,
  sizeOptions,
}: QuickBuyModalProps) => {
  const t = useTranslations('ProductPage');
 
  const hasSizes = sizeOptions && sizeOptions.length > 0;

  const [step, setStep] = useState(hasSizes ? 1 : 2);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (open) {
      setStep(hasSizes ? 1 : 2);
      setSelectedSize(null);
      setIsSuccess(false);
      form.reset();
    }
  }, [open, hasSizes, form]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size.toLowerCase());
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Find the selected variant
    let variantId: string;

    if (hasSizes && selectedSize) {
      const variant = product.variants.edges.find((edge) =>
        edge.node.selectedOptions.some(
          (option) =>
            option.name.toLowerCase() === 'розмір' &&
            option.value.toLowerCase() === selectedSize.toLowerCase()
        )
      )?.node;

      if (!variant) {
        toast.error('Не удалось найти выбранный размер');
        return;
      }
      variantId = variant.id;
    } else {
      // No sizes, use first available variant
      const variant = product.variants.edges[0]?.node;
      if (!variant) {
        toast.error('Товар недоступен');
        return;
      }
      variantId = variant.id;
    }

    // Get discount percentage
    const discountPercentage = Number(
      product.metafields.find((m) => m?.key === 'znizka')?.value || '0'
    ) || 0;

    startTransition(async () => {
      const result = await createQuickOrder({
        variantId,
        quantity: 1,
        name: values.name,
        phone: values.phone,
        productTitle: product.title,
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success(`Заказ №${result.orderName} успешно создан. Мы свяжемся с вами в ближайшее время.`);
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else {
        toast.error(result.errors?.[0] || 'Не удалось создать заказ');
      }
    });
  };

  const sortedSizeOptions = sizeOptions?.slice().sort(compareSizes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>{t('quickOrderDescription')}</DialogDescription>
        </DialogHeader>

        {isSuccess && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-center text-lg font-medium">
              Заказ успешно оформлен!
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Мы свяжемся с вами в ближайшее время
            </p>
          </div>
        )}

        {!isSuccess && step === 1 && hasSizes && (
          <div className="py-4">
            <h3 className="mb-4 font-semibold">{t('selectSize')}</h3>
            <div className="flex flex-wrap gap-2">
              {sortedSizeOptions?.map((s) => {
                const variant = product.variants.edges.find((edge) =>
                  edge.node.selectedOptions.some(
                    (option) =>
                      option.name.toLowerCase() === 'розмір' &&
                      option.value.toLowerCase() === s.toLowerCase()
                  )
                )?.node;
                const availableForSale = variant?.availableForSale ?? false;
                return (
                  <Button
                    key={s}
                    variant={
                      selectedSize === s.toLowerCase() ? 'default' : 'outline'
                    }
                    className={cn('rounded-md min-w-[50px] relative')}
                    onClick={() => handleSizeSelect(s)}
                    disabled={!availableForSale}
                  >
                    {s}
                    {!availableForSale && <CrossedLine />}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {!isSuccess && step === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ваше имя" 
                        autoComplete="name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="+380..." 
                        autoComplete="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        {!isSuccess && (
          <DialogFooter className="mt-4">
            {step === 1 && (
              <Button onClick={handleNextStep} disabled={!selectedSize || isPending} className="w-full sm:w-auto">
                {t('next')}
              </Button>
            )}
            {step === 2 && (
              <div className="flex w-full gap-2">
                {hasSizes && (
                  <Button variant="outline" onClick={handlePrevStep} disabled={isPending} className="flex-1">
                    {t('back')}
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={!form.formState.isValid || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    t('submitOrder')
                  )}
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};