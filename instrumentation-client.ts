// PostHog is initialized in src/app/providers/index.tsx via PostHogProvider

import { initBotId } from 'botid/client/core';

initBotId({
  protect: [
    { path: '/api/auth/sign-in/email', method: 'POST' },
    { path: '/api/auth/sign-up/email', method: 'POST' },
    { path: '/api/auth/forget-password', method: 'POST' },
    { path: '/api/auth/*', method: 'POST' },
    { path: '/*/checkout/*', method: 'POST' },
  ],
});
