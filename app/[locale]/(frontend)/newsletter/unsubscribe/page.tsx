import { Link } from '@shared/i18n/navigation';

interface PageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function NewsletterUnsubscribePage({ searchParams }: PageProps) {
  const { email, token } = await searchParams;

  let success = false;
  let alreadyUnsubscribed = false;
  let errorMessage = '';

  if (email && token) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const res = await fetch(
        `${appUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        success = true;
        alreadyUnsubscribed = !!data.alreadyUnsubscribed;
      } else {
        errorMessage = data.error || 'Помилка відписки';
      }
    } catch {
      errorMessage = 'Помилка з\'єднання. Спробуйте пізніше.';
    }
  } else {
    errorMessage = 'Недійсне посилання для відписки.';
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {success ? (
          <>
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-semibold mb-2">
              {alreadyUnsubscribed ? 'Ви вже відписані' : 'Відписка успішна'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {alreadyUnsubscribed
                ? 'Цей email вже було відписано від розсилки.'
                : 'Ви більше не будете отримувати нашу розсилку.'}
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">✕</div>
            <h1 className="text-2xl font-semibold mb-2">Помилка</h1>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
          </>
        )}
        <Link href="/" className="underline text-sm">
          Повернутись на головну
        </Link>
      </div>
    </div>
  );
}
