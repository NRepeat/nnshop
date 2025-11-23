'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { getContactInfoSchema } from '../schema/contactInfoSchema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import saveContactInfo from '../api/save-contact-info';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

export default function ContactInfoForm() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('ContactInfoForm');

  const contactInfoSchema = getContactInfoSchema(t);

  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
    shouldUnregister: false,
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: 'UA',
    },
  });

  async function onSubmit(data: z.infer<typeof contactInfoSchema>) {
    try {
      const result = await saveContactInfo(data);
      if (result) {
        toast.success(t('contactInformationSaved'));
        router.push(`/${locale}/checkout/delivery`);
      } else {
        toast.error(t('errorSavingContactInformation'));
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error(t('errorSavingContactInformation'));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {form.formState.isSubmitted &&
          Object.keys(form.formState.errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-none">
              <h4 className="text-red-800 font-medium text-sm mb-2">
                {t('pleaseFixErrors')}
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                    {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-1 relative">
                <FormLabel className="text-sm font-medium">
                  {t('firstName')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('enterYourName')}
                    {...field}
                    className={clsx(
                      form.formState.isSubmitted &&
                        form.formState.errors.name &&
                        'border-red-500 focus-visible:ring-red-500',
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="sm:col-span-1 relative">
                <FormLabel className="text-sm font-medium">
                  {t('lastName')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('enterYourLastName')}
                    {...field}
                    className={clsx(
                      form.formState.isSubmitted &&
                        form.formState.errors.lastName &&
                        'border-red-500 focus-visible:ring-red-500 ',
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className=" relative">
              <FormLabel className="text-sm font-medium">
                {t('emailAddress')}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('enterYourEmail')}
                  {...field}
                  className={clsx(
                    form.formState.isSubmitted &&
                      form.formState.errors.email &&
                      'border-red-500 focus-visible:ring-red-500',
                  )}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem className="sm:col-span-1 relative">
                <FormLabel className="text-sm font-medium">
                  {t('country')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="UA"
                    maxLength={2}
                    {...field}
                    className={clsx(
                      form.formState.isSubmitted &&
                        form.formState.errors.countryCode &&
                        'border-red-500 focus-visible:ring-red-500',
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="sm:col-span-2 relative">
                <FormLabel className="text-sm font-medium">
                  {t('phoneNumber')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+380 50 123 45 67"
                    {...field}
                    className={clsx(
                      form.formState.isSubmitted &&
                        form.formState.errors.phone &&
                        'border-red-500 focus-visible:ring-red-500',
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-none"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? t('saving') : t('continueToDelivery')}
        </Button>
      </form>
    </Form>
  );
}
