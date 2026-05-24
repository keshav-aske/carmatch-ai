# CarMatch AI

Helps confused Indian car buyers go from **"I don't know what to buy"** to **"I'm confident about my shortlist."**

A 4-step lifestyle quiz feeds a weighted scoring engine that ranks 20 popular India-market cars across **budget, household, primary use,** and **top priority** — returning a personalised top-3 with match reasoning, side-by-side specs, and real pros & cons.

---

## One-command setup

```bash
npm install && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> Requires Node.js 18.17+ (Next.js 14). No Docker, no external APIs, no database setup.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide icons |
| Backend | Next.js API routes — matching engine + saved-shortlist store |
| Data | Local JSON file (`data/cars.json`) — 20 cars, Indian market 2024 |
| Algorithm | Pure TypeScript scoring engine in `lib/matching.ts` |
| Persistence | File-based JSON store in `os.tmpdir()` via `lib/store.ts` |

---

## Project structure

```
carmatch-ai/
├── app/
│   ├── api/match/route.ts      # Backend matching endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Single-page state machine (landing → quiz → results)
├── components/
│   ├── Landing.tsx             # Hero + features + CTA
│   ├── QuizWizard.tsx          # 4-step interactive form
│   └── ShortlistDashboard.tsx  # Top-3 cards + side-by-side spec grid
├── data/
│   └── cars.json               # 20-car Indian-market seed dataset
├── lib/
│   ├── matching.ts             # Weighted scoring engine
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # cn() + INR formatter
└── package.json
```

---

## How the matching algorithm works

Each car receives a **DimensionScore** across 4 axes (each 0–100):

| Dimension | What's scored | Weight |
|---|---|---|
| `budget` | How close the car's price is to your budget band (penalised if over) | 1.3× |
| `household` | Whether seating count fits the household size | 1.0× |
| `use` | Body-style + ground-clearance + cargo fit for primary use | 1.2× |
| `priority` | The single hardest-weighted axis — mapped to NCAP / kmpl / bhp / features / boot space | 1.6× |

The four scores are weighted-averaged into a final **Match %**. Top 3 cars are returned with:
- Generated `match_reasons` (plain-English explanations of *why* they fit)
- `spec_highlights` (the spec rows most relevant to the user's priority are flagged)
- The car's pros, cons, and review summary

The algorithm lives in [`lib/matching.ts`](lib/matching.ts) — pure functions, no external dependencies, easy to extend with new dimensions or alternate weighting schemes.

---

## API

### `POST /api/match`

Request body:
```json
{
  "household_size": "3-4",
  "primary_use": "road_trips",
  "budget": "20l_35l",
  "top_priority": "safety"
}
```

Response:
```json
{
  "results": [
    {
      "car": { "id": "...", "make": "Mahindra", "model": "XUV700", ... },
      "match_percentage": 92,
      "rank": 1,
      "match_reasons": ["5-star Global NCAP — a top-tier safety performer", ...],
      "dimension_scores": { "budget": 100, "household": 100, "use": 95, "priority": 100 },
      "spec_highlights": [{ "label": "Safety", "value": "5★ NCAP", "highlighted": true }, ...]
    },
    ...
  ],
  "quiz_summary": {
    "household": "3–4 people",
    "use": "Long-distance road trips",
    "budget": "₹20–35 Lakh",
    "priority": "Safety"
  }
}
```

### `GET /api/match`
Returns dataset metadata (size, categories) — useful for sanity checks.

### `POST /api/shortlist`
Persists a top-3 shortlist returned by `/api/match`. Body: `{ "response": <MatchResponse> }`. Returns `{ "id": "abc12345" }` — a short, URL-safe identifier.

### `GET /api/shortlist/[id]`
Retrieves a saved shortlist by id. 404 if not found.

### Page: `/s/[id]`
Server-rendered view of a saved shortlist. Anyone with the link can view the exact same top-3, side-by-side specs, and quiz summary — no login required. Used by the "Save & share" button on the results dashboard.

---

## Persistence

Saved shortlists are written to a JSON file at `os.tmpdir() / carmatch-shortlists.json` via a small write-locked store (`lib/store.ts`). This zero-dependency design works identically on Windows, Mac, Linux, and Vercel.

**On Vercel:** the file lives in the serverless function's `/tmp` directory, which persists for the lifetime of a warm Lambda instance (~minutes to hours of inactivity, then cold-starts). For demo and short-session sharing this is fine; for indefinite persistence swap the two functions in `lib/store.ts` to use [`@vercel/kv`](https://vercel.com/docs/storage/vercel-kv) — provision in the Vercel dashboard, `npm i @vercel/kv`, replace `readAll/writeAll` with `kv.hgetall/hset`. No other code changes required.

---

## Dataset notes

- **20 cars** across 6 categories: Hatchback (3), Sedan (4), SUV (7), Hybrid (2), MPV (1), EV (3)
- Prices in INR (ex-showroom approximations, 2024)
- Mileage in **kmpl** (range in **km** for EVs)
- Power in **bhp**, torque in **Nm** — Indian-market units throughout
- Each car has real-world inspired pros/cons and a one-paragraph review summary

Brands represented: Maruti Suzuki, Tata, Hyundai, Mahindra, Toyota, Honda, Kia, MG, Skoda, Volkswagen.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the project |
