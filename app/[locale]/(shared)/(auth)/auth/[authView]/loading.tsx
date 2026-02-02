export default function AuthLoading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center self-center animate-pulse">
      <div className="w-full max-w-md p-8 space-y-4">
        <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
        <div className="h-10 bg-muted rounded w-full mt-6" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      </div>
    </main>
  );
}