# SSR / Pre-render: Preparation Notes (SPA today)

Цей проєкт зараз SPA (Vite + React Router). Нижче — мінімальна структура, щоб було просто перейти до SSR або pre-render.

## 1) Head management уже централізований

У фронті використовується хук `useSEO` (див. `src/hooks/useSEO.ts`), який:
- ставить `document.title`
- оновлює `<meta name="description">`
- додає OG/Twitter meta
- додає canonical
- підтримує JSON-LD

Це важливо, бо SSR/prerender потребує того ж самого набору мета-тегів, але на сервері/під час білду.

## 2) Що потрібно для pre-render (простий шлях)

Варіант A (рекомендовано для швидкого виграшу в SEO): pre-render основних статичних маршрутів.
- prerender: `/`, `/products`, `/stores`, `/about`, `/auth`, `/favorites` (якщо доступно анонімно)
- динамічні сторінки типу `/product/:id` можна pre-render тільки якщо є список id на білд-час (або робити ISR/SSR)

Технічні кроки (високорівнево):
- додати prerenderer (наприклад, `vite-plugin-prerender` або окремий node-скрипт + puppeteer)
- забезпечити, що роутер може відрендеритись без реальних user-даних

## 3) Що потрібно для SSR (складніший шлях)

Варіант B: SSR (Node runtime).
- перенести маршрути/дані на SSR-friendly підхід
- замінити `document.*` у `useSEO` на абстракцію, яка в SSR повертає head-опис (наприклад, через контекст)

Мінімальна вимога до data-layer:
- всі HTTP-запити мають бути централізовані (React Query уже використовується)
- SSR з React Query: `dehydrate`/`Hydrate` на сервері/клієнті

## 4) Обмеження

- У SPA `useSEO` працює тільки після hydration (після завантаження JS). Для SEO-ботів без JS потрібен pre-render або SSR.

---

Цей документ — “підготовчий”. Якщо хочеш, можу додати конкретний варіант під ваш деплой (Netlify/Vercel) і поточний роутинг.
