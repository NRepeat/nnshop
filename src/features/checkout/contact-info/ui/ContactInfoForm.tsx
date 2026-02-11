'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from '@shared/i18n/navigation';
import { getContactInfoSchema, ContactInfoFormData } from '../schema/contactInfoSchema';
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
import { ContactInformation } from '~/generated/prisma/client';
import { User } from 'better-auth';
import { Checkbox } from '@shared/ui/checkbox';

export default function ContactInfoForm({
  contactInfo,
  user,
}: {
  contactInfo: ContactInformation | null;
  user: User | null;
}) {
  const router = useRouter();
  const t = useTranslations('ContactInfoForm');

  const contactInfoSchema = getContactInfoSchema(t);

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema) as any,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
    shouldUnregister: false,
    defaultValues: {
      name: contactInfo?.name ? contactInfo.name : user?.name || '',
      lastName: contactInfo?.lastName || '',
      email: contactInfo?.email || user?.email || '',
      phone: contactInfo?.phone || '+380',
      countryCode: contactInfo?.countryCode || 'UA',
      preferViber: contactInfo?.preferViber || false,
    },
  });

  async function onSubmit(data: ContactInfoFormData) {
    try {
      const result = await saveContactInfo(data);
      if (result) {
        toast.success(t('contactInformationSaved'));
        router.push(`/checkout/delivery`);
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
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
              <FormItem className="sm:col-span-1">
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
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
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
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
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
              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="countryCode"
            render={() => (
              <FormItem className="sm:col-span-1 hidden">
                <FormLabel className="text-sm font-medium">
                  {t('country')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="UA"
                    maxLength={2}
                    defaultValue="UA"
                    readOnly
                    className={clsx(
                      form.formState.isSubmitted &&
                        form.formState.errors.countryCode &&
                        'border-red-500 focus-visible:ring-red-500',
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
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
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preferViber"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal cursor-pointer">
                {t('preferViber')}
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full rounded-md"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? t('saving') : t('continueToDelivery')}
        </Button>
      </form>
    </Form>
  );
}
