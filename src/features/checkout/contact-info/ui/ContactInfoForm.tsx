'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { contactInfoSchema } from '../schema/contactInfoSchema';
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

export default function ContactInfoForm() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof contactInfoSchema>>({
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

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const existingContactInfo = await getContactInfo();
        if (existingContactInfo) {
          form.reset(existingContactInfo);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    }
    fetchContactInfo();
  }, [form]);

  async function onSubmit(data: z.infer<typeof contactInfoSchema>) {
    const validationResult = contactInfoSchema.safeParse(data);

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
      const result = await saveContactInfo(data);
      if (result.success) {
        toast.success(result.message);
        router.push(`/${locale}/checkout/delivery`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('An error occurred while saving your contact information.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* General form errors - only show after submit attempt */}
        {form.formState.isSubmitted &&
          Object.keys(form.formState.errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-red-800 font-medium text-sm mb-2">
                Please fix the following errors:
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                    {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        {/* Mobile-optimized form grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormLabel className="text-sm font-medium">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    className={
                      form.formState.isSubmitted && form.formState.errors.name
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    className={
                      form.formState.isSubmitted &&
                      form.formState.errors.lastName
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
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
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  className={
                    form.formState.isSubmitted && form.formState.errors.email
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormLabel className="text-sm font-medium">Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder="UA"
                    maxLength={2}
                    {...field}
                    className={
                      form.formState.isSubmitted &&
                      form.formState.errors.countryCode
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+380 50 123 45 67"
                    {...field}
                    className={
                      form.formState.isSubmitted && form.formState.errors.phone
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#325039] hover:bg-[#2a4330] text-white"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Continue to Delivery'}
        </Button>
      </form>
    </Form>
  );
}
