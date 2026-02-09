'use client';

import { client } from '@/features/auth/lib/client';
import { SignInFormData, SignUpFormData } from './schema';
import { toast } from 'sonner';

// Helper function to get translations on the client side
const getClientTranslation = (key: string, fallback: string) => {
  // This is a simple approach - in a real app you might want to access
  // the translation context or pass translations as parameters
  return fallback;
};

export const onSignInSubmit = async (data: SignInFormData) => {
  try {
    const result = await client.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toast.error(
        result.error.message ||
          getClientTranslation('auth.errors.signInFailed', 'Sign in failed'),
      );
      return;
    }

    toast.success(
      getClientTranslation('auth.success.welcomeBack', 'Welcome back!'),
    );
    // Redirect will be handled by the auth provider
    window.location.href = '/';
  } catch (error) {
    console.error('Sign in error:', error);
    toast.error(
      getClientTranslation(
        'auth.errors.unexpectedError',
        'An unexpected error occurred',
      ),
    );
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
      toast.error(
        result.error.message ||
          getClientTranslation('auth.errors.signUpFailed', 'Sign up failed'),
      );
      return;
    }

    toast.success(
      getClientTranslation(
        'auth.success.accountCreated',
        'Account created successfully!',
      ),
    );
    // Redirect will be handled by the auth provider
    window.location.href = '/';
  } catch (error) {
    console.error('Sign up error:', error);
    toast.error(
      getClientTranslation(
        'auth.errors.unexpectedError',
        'An unexpected error occurred',
      ),
    );
  }
};

// Social auth handlers
export const onGoogleSignIn = async () => {
  try {
    await client.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  } catch (error) {
    console.error('Google sign in error:', error);
    toast.error(
      getClientTranslation(
        'auth.errors.googleSignInFailed',
        'Google sign in failed',
      ),
    );
  }
};

export const onShopifySignIn = async () => {
  try {
    await client.signIn.social({
      provider: 'shopify',
    });
  } catch (error) {
    console.error('Shopify sign in error:', error);
    toast.error(
      getClientTranslation(
        'auth.errors.shopifySignInFailed',
        'Shopify sign in failed',
      ),
    );
  }
};

// Enhanced versions with translation support
export const createSignInHandler = (
  tErrors: (key: string) => string,
  tSuccess: (key: string) => string,
) => {
  return async (data: SignInFormData) => {
    try {
      const result = await client.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message || tErrors('signInFailed'));
        return;
      }

      toast.success(tSuccess('welcomeBack'));
      window.location.href = '/';
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(tErrors('unexpectedError'));
    }
  };
};

export const createSignUpHandler = (
  tErrors: (key: string) => string,
  tSuccess: (key: string) => string,
) => {
  return async (data: SignUpFormData) => {
    try {
      const result = await client.signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split('@')[0],
      });

      if (result.error) {
        toast.error(result.error.message || tErrors('signUpFailed'));
        return;
      }

      toast.success(tSuccess('accountCreated'));
      window.location.href = '/';
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(tErrors('unexpectedError'));
    }
  };
};

export const createGoogleSignInHandler = (tErrors: (key: string) => string) => {
  return async () => {
    try {
      await client.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error(tErrors('googleSignInFailed'));
    }
  };
};

export const createShopifySignInHandler = (
  tErrors: (key: string) => string,
) => {
  return async () => {
    try {
      await client.signIn.social({
        provider: 'shopify',
      });
    } catch (error) {
      console.error('Shopify sign in error:', error);
      toast.error(tErrors('shopifySignInFailed'));
    }
  };
};

// Legacy action for backward compatibility (if needed)
export const onSubmit = async () => {
  //todo
};
