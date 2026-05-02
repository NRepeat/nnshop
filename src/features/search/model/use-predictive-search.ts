'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useLocale } from 'next-intl';
import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';

type PredictiveSearchResult = NonNullable<
  PredictiveSearchQuery['predictiveSearch']
>;

export function usePredictiveSearch() {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<PredictiveSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch('/api/predictive-search', {
      method: 'POST',
      body: JSON.stringify({ query: debouncedQuery, locale }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, locale]);

  return { query, setQuery, debouncedQuery, results, loading };
}
