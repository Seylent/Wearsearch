import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-5 max-w-md">
        <h1 className="text-8xl font-bold text-foreground/10">404</h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Сторінку не знайдено</h2>
          <p className="text-muted-foreground">Сторінка не існує або була переміщена.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
            На головну
          </Link>
          <Link
            href="/products"
            className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium"
          >
            Каталог
          </Link>
        </div>
      </div>
    </div>
  );
}
