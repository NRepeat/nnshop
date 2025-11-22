'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { DeliveryInfo, deliverySchema } from '../schema/deliverySchema';
import { SelectedDepartment } from '@features/novaPoshta';
import { Button } from '@shared/ui/button';
import { Form } from '@shared/ui/form';
import { saveDeliveryInfo } from '../api/saveDeliveryInfo';
import NovaPoshtaForm from './NovaPoshtaForm';
import UkrPoshtaForm from './UkrPoshtaForm';
import DeliveryMethodSelection from './DeliveryMethodSelection';

interface DeliveryFormProps {
  defaultValues?: DeliveryInfo | null;
}

export default function DeliveryForm({ defaultValues }: DeliveryFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof deliverySchema>>({
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

  async function onSubmit(data: z.infer<typeof deliverySchema>) {
    const validationResult = deliverySchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages[0]) {
          form.setError(field as keyof typeof data, {
            type: 'manual',
            message: messages[0],
          });
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveDeliveryInfo(data);

      if (result.success) {
        toast.success(result.message);
        router.push(`/${locale}/checkout/payment`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving delivery info:', error);
      toast.error('An error occurred while saving your delivery information.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {form.formState.isSubmitted &&
            Object.keys(form.formState.errors).length > 0 && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-red-800 font-semibold text-sm">
                    Please fix the following errors:
                  </h4>
                </div>
                <ul className="text-red-700 text-sm space-y-2 ml-9">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => (
                      <li key={field} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
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
              className="w-full h-14 bg-[#325039] hover:bg-[#2a4330] text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving Delivery Info...</span>
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
                  <span>Save Delivery Info & Continue</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
