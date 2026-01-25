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
import { useState } from 'react';
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать не менее 2 символов.',
  }),
  phone: z.string().min(10, {
    message: 'Номер телефона должен состоять не менее чем из 10 цифр.',
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
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size.toLowerCase());
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({
      size: selectedSize,
      ...values,
    });
    onOpenChange(false);
  };

  const sortedSizeOptions = sizeOptions?.slice().sort(compareSizes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>{t('quickOrderDescription')}</DialogDescription>
        </DialogHeader>

        {step === 1 && (
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
                    className={cn('rounded-none min-w-[50px] relative')}
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

        {step === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Ваше имя" {...field} />
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
                      <Input placeholder="+380..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter>
          {step === 1 && (
            <Button onClick={handleNextStep} disabled={!selectedSize}>
              {t('next')}
            </Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={handlePrevStep}>
                {t('back')}
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                type="submit"
                disabled={!form.formState.isValid}
              >
                {t('submitOrder')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};