export const token = process.env.SANITY_API_READ_TOKEN;

if (!token && typeof window === 'undefined') {
  console.warn('Missing SANITY_API_READ_TOKEN - live preview features will be disabled');
}
