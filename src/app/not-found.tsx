import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-white/10">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Сторінку не знайдено</h2>
          <p className="text-muted-foreground">
            Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="default">
              На головну
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              Каталог
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
