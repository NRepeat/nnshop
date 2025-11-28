'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { toast } from 'sonner';
import { useRouter } from '@shared/i18n/navigation';
import { DeliveryInfo, getDeliverySchema } from '../model/deliverySchema';
import { SelectedDepartment } from '@features/novaPoshta';
import { Button } from '@shared/ui/button';
import { Form } from '@shared/ui/form';
import { saveDeliveryInfo } from '../api/saveDeliveryInfo';
import NovaPoshtaForm from './NovaPoshtaForm';
import UkrPoshtaForm from './UkrPoshtaForm';
import DeliveryMethodSelection from './DeliveryMethodSelection';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDraftOrder } from '@features/order/api/create';

interface DeliveryFormProps {
  defaultValues?: DeliveryInfo | null;
}

export default function DeliveryForm({ defaultValues }: DeliveryFormProps) {
  const router = useRouter();
  const t = useTranslations('DeliveryForm');

  const deliverySchema = getDeliverySchema(t);

  const form = useForm<DeliveryInfo>({
    //@ts-ignore
    resolver: zodResolver(deliverySchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
    shouldUnregister: false,
    defaultValues: {
      deliveryMethod: defaultValues?.deliveryMethod || 'novaPoshta',
      novaPoshtaDepartment: defaultValues?.novaPoshtaDepartment || undefined,
      country: defaultValues?.country || '',
      address: defaultValues?.address || '',
      apartment: defaultValues?.apartment || '',
      city: defaultValues?.city || '',
      postalCode: defaultValues?.postalCode || '',
    },
  });

  const selectedDeliveryMethod = form.watch('deliveryMethod');

  const handleDepartmentSelect = (department: SelectedDepartment) => {
    form.setValue('novaPoshtaDepartment', {
      id: department.id,
      shortName: department.shortName,
      addressParts: department.addressParts,
      coordinates: department.coordinates,
    });
  };

  const onSubmit: SubmitHandler<DeliveryInfo> = async (data) => {
    try {
      const result = await saveDeliveryInfo(data);

      if (result.success) {
        const completeCheckoutData = await getCompleteCheckoutData();
        const draftOrder = await createDraftOrder(completeCheckoutData);
        toast.success(t('deliveryInformationSavedSuccessfully'));
        router.push(
          `/checkout/payment/${draftOrder.order?.id.split('/').pop()}`,
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving delivery info:', error);
      toast.error(t('errorSavingDeliveryInformation'));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        {/*@ts-ignore*/}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {form.formState.isSubmitted &&
            Object.keys(form.formState.errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-medium text-sm mb-2">
                  {t('pleaseFixErrors')}
                </h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => (
                      <li key={field} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                        {error?.message}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          <DeliveryMethodSelection />

          {selectedDeliveryMethod === 'novaPoshta' && (
            <NovaPoshtaForm handleDepartmentSelect={handleDepartmentSelect} />
          )}

          {selectedDeliveryMethod === 'ukrPoshta' && <UkrPoshtaForm />}

          <div className="">
            <Button
              type="submit"
              className="w-full rounded-none "
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('savingDeliveryInfo')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t('saveAndContinue')}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
