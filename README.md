# Wearsearch - Fashion Discovery Platform

A modern fashion discovery platform built with React, TypeScript, and Tailwind CSS.

## Features

- Product discovery and search across brands and stores
- User authentication and favorites
- Store ratings and reviews
- Admin tools for managing products, stores, and brands
- Internationalization (English, Ukrainian)

## Tech Stack

- Next.js 16 (App Router), React 18, TypeScript 5
- TanStack Query, Next.js App Router
- Tailwind CSS, shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, pnpm, or bun

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set the API URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:3000
API_PROXY_TARGET=http://localhost:3000
```

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Scripts

| Script               | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Build for production     |
| `npm run start`      | Run production server    |
| `npm run lint`       | Run ESLint               |
| `npm run type-check` | Run TypeScript checks    |
| `npm run test`       | Run unit tests           |

## Deployment

See `DEPLOYMENT.md` for the production checklist.

## License

Proprietary and confidential.
