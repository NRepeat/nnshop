import { Link } from '@shared/i18n/navigation';

interface PageProps {
  searchParams: Promise<{ id?: string; email?: string; token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { id, email, token } = await searchParams;

  let success = false;
  let errorMessage = '';

  if (id && email && token) {
    try {
      const appUrl = process.env.PRICE_APP_URL || 'http://localhost:3000';
      const res = await fetch(
        `${appUrl}/api/unsubscribe?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        success = true;
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
            <h1 className="text-2xl font-semibold mb-2">Відписка успішна</h1>
            <p className="text-muted-foreground mb-6">
              Ви більше не будете отримувати сповіщення про зміну ціни для цього товару.
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
