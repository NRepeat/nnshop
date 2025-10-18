'use client';

import { client } from '@/service/auth/client';
import { SignInFormData, SignUpFormData } from './shema';
import { toast } from 'sonner';

export const onSignInSubmit = async (data: SignInFormData) => {
  try {
    const result = await client.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toast.error(result.error.message || 'Sign in failed');
      return;
    }

    toast.success('Welcome back!');
    // Redirect will be handled by the auth provider
    window.location.href = '/';
  } catch (error) {
    console.error('Sign in error:', error);
    toast.error('An unexpected error occurred');
  }
};

export const onSignUpSubmit = async (data: SignUpFormData) => {
  try {
    const result = await client.signUp.email({
      email: data.email,
      password: data.password,
      name: data.email.split('@')[0], // Use email prefix as default name
    });

    if (result.error) {
      toast.error(result.error.message || 'Sign up failed');
      return;
    }

    toast.success('Account created successfully!');
    // Redirect will be handled by the auth provider
    window.location.href = '/';
  } catch (error) {
    console.error('Sign up error:', error);
    toast.error('An unexpected error occurred');
  }
};

// Social auth handlers
export const onGoogleSignIn = async () => {
  try {
    await client.signIn.social({
      provider: 'google',
    });
  } catch (error) {
    console.error('Google sign in error:', error);
    toast.error('Google sign in failed');
  }
};

export const onShopifySignIn = async () => {
  try {
    await client.signIn.social({
      provider: 'shopify',
    });
  } catch (error) {
    console.error('Shopify sign in error:', error);
    toast.error('Shopify sign in failed');
  }
};

// Legacy action for backward compatibility (if needed)
export const onSubmit = async () => {
  //todo
};
