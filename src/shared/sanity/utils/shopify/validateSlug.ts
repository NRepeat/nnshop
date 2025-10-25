'use client';

import { Rule, Slug } from 'sanity';

const MAX_LENGTH = 96;

export const validateSlug = (Rule: Rule) => {
  return Rule.required().custom(async (value: Slug) => {
    const currentSlug = value && value.current;
    if (!currentSlug) {
      return true;
    }

    if (currentSlug.length >= MAX_LENGTH) {
      return `Must be less than ${MAX_LENGTH} characters`;
    }

    if (currentSlug !== currentSlug.toLowerCase()) {
      return 'Must be a valid slug';
    }
    return true;
  });
};
