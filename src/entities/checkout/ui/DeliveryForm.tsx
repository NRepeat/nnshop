'use client';

import React from 'react';
import { Form, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { DeliveryInfo, deliverySchema } from '../schema/delivery';
import { SelectedDepartment, NovaPoshtaButton } from '@entities/novaPoshta';
import { Button } from '@shared/ui/button';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { saveDeliveryInfo } from '../api/saveDeliveryInfo';

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
          {/* General form errors - only show after submit attempt */}
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

          {/* Delivery Method Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                      Choose Delivery Method
                    </FormLabel>
                    <p className="text-sm text-gray-600">
                      Your delivery preferences will be saved to your cart for
                      faster checkout.
                    </p>
                  </div>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => field.onChange('novaPoshta')}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-200 ${
                          field.value === 'novaPoshta'
                            ? 'border-[#325039] bg-[#325039] text-white shadow-lg'
                            : 'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              field.value === 'novaPoshta'
                                ? 'bg-white/20'
                                : 'bg-[#325039]/10'
                            }`}
                          >
                            <svg
                              className={`w-6 h-6 ${
                                field.value === 'novaPoshta'
                                  ? 'text-white'
                                  : 'text-[#325039]'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h3
                              className={`font-semibold text-base ${
                                field.value === 'novaPoshta'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              Nova Poshta
                            </h3>
                            <p
                              className={`text-sm ${
                                field.value === 'novaPoshta'
                                  ? 'text-white/80'
                                  : 'text-gray-600'
                              }`}
                            >
                              Fast and reliable delivery
                            </p>
                          </div>
                        </div>
                        {field.value === 'novaPoshta' && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-[#325039]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange('ukrPoshta')}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-200 ${
                          field.value === 'ukrPoshta'
                            ? 'border-[#325039] bg-[#325039] text-white shadow-lg'
                            : 'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              field.value === 'ukrPoshta'
                                ? 'bg-white/20'
                                : 'bg-[#325039]/10'
                            }`}
                          >
                            <svg
                              className={`w-6 h-6 ${
                                field.value === 'ukrPoshta'
                                  ? 'text-white'
                                  : 'text-[#325039]'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h3
                              className={`font-semibold text-base ${
                                field.value === 'ukrPoshta'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              UkrPoshta
                            </h3>
                            <p
                              className={`text-sm ${
                                field.value === 'ukrPoshta'
                                  ? 'text-white/80'
                                  : 'text-gray-600'
                              }`}
                            >
                              Traditional postal service
                            </p>
                          </div>
                        </div>
                        {field.value === 'ukrPoshta' && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-[#325039]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-2" />
                </FormItem>
              )}
            />
          </div>

          {/* Nova Poshta Form */}
          {selectedDeliveryMethod === 'novaPoshta' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <FormField
                control={form.control}
                name="novaPoshtaDepartment"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="mb-4">
                      <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                        Select Nova Poshta Department
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        Choose the most convenient Nova Poshta branch or parcel
                        locker for your delivery.
                      </p>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <NovaPoshtaButton
                          onDepartmentSelect={handleDepartmentSelect}
                          className="w-full"
                          initialText={field.value?.shortName || ''}
                          initialDescription={
                            field.value?.addressParts
                              ? `${field.value.addressParts.city || ''} вул. ${field.value.addressParts.street || ''}, ${field.value.addressParts.building || ''}`
                              : 'Обрати відділення або поштомат'
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-2" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* UkrPoshta Form */}
          {selectedDeliveryMethod === 'ukrPoshta' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delivery Address
                </h3>
                <p className="text-sm text-gray-600">
                  Please provide your complete delivery address for UkrPoshta.
                </p>
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                        Country/Region
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter country/region"
                            {...field}
                            className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                              form.formState.isSubmitted &&
                              form.formState.errors.country
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : 'border-gray-200 focus:border-[#325039]'
                            }`}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                          Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter street address"
                              {...field}
                              className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                                form.formState.isSubmitted &&
                                form.formState.errors.address
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : 'border-gray-200 focus:border-[#325039]'
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                          Apartment
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter apartment number"
                              {...field}
                              className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                                form.formState.isSubmitted &&
                                form.formState.errors.apartment
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : 'border-gray-200 focus:border-[#325039]'
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                          City
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter city"
                              {...field}
                              className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                                form.formState.isSubmitted &&
                                form.formState.errors.city
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : 'border-gray-200 focus:border-[#325039]'
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                          Postal Code
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter postal code"
                              {...field}
                              className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                                form.formState.isSubmitted &&
                                form.formState.errors.postalCode
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : 'border-gray-200 focus:border-[#325039]'
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
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
