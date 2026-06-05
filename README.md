# CarMatch AI

CarMatch AI is a Next.js app that turns a short quiz into a personalized top-3 car shortlist. It is built to help a buyer move from "I do not know what to pick" to a clear, explainable recommendation with matching reasons, pros and cons, and shareable results.

## What it does

- Guides users through a short multi-step quiz
- Ranks cars with a deterministic scoring engine
- Shows a top-3 shortlist with match reasons and spec highlights
- Saves results to Upstash Redis and exposes shareable links
- Server-renders saved shortlists at `/s/[id]`

## Tech stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Lucide React
- Upstash Redis

## Getting started

### Prerequisites

- Node.js 18.17 or newer
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Persistence uses Upstash Redis. The app can still run without credentials, but saving and sharing shortlists will fail until these are set:

```env
KV_REST_API_URL=https://your-instance.upstash.io
KV_REST_API_TOKEN=your_token_here
```

## Available scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - start the production server
- `npm run lint` - run the Next.js linter

## API routes

### `POST /api/match`

Creates a ranked shortlist from quiz answers.

### `POST /api/shortlist`

Saves a shortlist and returns a shareable ID.

### `GET /api/shortlist/[id]`

Fetches a saved shortlist by ID.

## Project structure

```text
app/
  api/match/route.ts
  api/shortlist/route.ts
  api/shortlist/[id]/route.ts
  s/[id]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  Landing.tsx
  QuizWizard.tsx
  ShortlistDashboard.tsx
data/
  cars.json
lib/
  matching.ts
  store.ts
  types.ts
  utils.ts
```

## Notes

- The matching engine is deterministic, so the same answers always produce the same shortlist.
- The app is designed to work well on Vercel.
- If Redis credentials are missing, the quiz and ranking flow still work; only saving and sharing are disabled.

## License

No license file is currently included in this repository.
