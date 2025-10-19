import { z } from 'zod';

// Helper function to create sign-in schema with translations
export const createSignInSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({
      message: t('emailInvalid'),
    }),
    password: z.string().min(1, {
      message: t('passwordRequired'),
    }),
  });

// Helper function to create sign-up schema with translations
export const createSignUpSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z.string().email({
        message: t('emailInvalid'),
      }),
      password: z.string().min(8, {
        message: t('passwordTooShort'),
      }),
      confirmPassword: z.string().min(8, {
        message: t('passwordTooShort'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsDontMatch'),
      path: ['confirmPassword'],
    });

// Default schemas (for backward compatibility)
export const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

export const signUpSchema = z
  .object({
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters long.',
    }),
    confirmPassword: z.string().min(8, {
      message: 'Password must be at least 8 characters long.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports for forms
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

// Legacy schema for backward compatibility (if needed)
export const authClientShema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
});
