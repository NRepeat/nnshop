import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  capture_pageview: false,
  autocapture: false,
  capture_exceptions: false,
  session_recording: {
    maskAllInputs: false,
    maskInputOptions: { password: true },
  },
  loaded: (ph) => {
    ph.startSessionRecording();
  },
});
