# CarMatch AI

A 4-step lifestyle quiz that turns a confused Indian car buyer's situation into a personalised top-3 shortlist — with match reasoning, side-by-side specs, and pros/cons grounded in real Indian-market 2024 cars.

**Live:** https://carmatch-ai-dun.vercel.app
**Repo:** https://github.com/keshav-aske/carmatch-ai

---

## What I built and why

The brief was deliberately vague — *help a confused buyer go from "I don't know what to buy" to "I'm confident about my shortlist."* I interpreted that as: **reduce 20+ options to a defensible top-3 the buyer can act on, and explain the choices in plain English so they trust the result.**

What ships:

1. **A 4-step quiz** (household size, primary use, budget, top priority — multi-select). Designed to take under 60 seconds. Multi-priority because forcing one answer is artificial; most buyers want safety *and* fuel savings, or comfort *and* performance.
2. **A weighted scoring engine** ([lib/matching.ts](lib/matching.ts)) — pure TypeScript, deterministic, ~200 lines. Scores each car 0–100 across budget / household / use / priority dimensions, weights them (priority 1.6×, budget 1.3×, use 1.2×, household 1.0×), and ranks. Multi-priority averages individual priority scores.
3. **A confidence-oriented dashboard** — top-3 cards with rank badges, animated match-% rings, generated "why it matches" reasons tied to the user's actual answers, pros/cons, and a side-by-side spec grid that bolds the cells corresponding to their stated priorities.
4. **Persistence + shareable links** — POST `/api/shortlist` saves the result to Upstash Redis, GET `/s/[id]` server-renders the same shortlist for anyone with the link. Useful when a buyer wants to send their match to family.
5. **An India-localised 20-car dataset** ([data/cars.json](data/cars.json)) — Maruti, Tata, Hyundai, Mahindra, Toyota, Honda, Kia, MG, Skoda, VW. Realistic 2024 prices in INR, mileage in kmpl, torque in Nm, hand-written pros/cons and one-paragraph review summaries.

## What I deliberately cut

In rough order of "most painful to cut":

- **"Why not X?" adversarial reasoning.** For each recommendation, show 1-2 close-misses and one sentence on why they didn't win. This is the single feature most missing for *confidence* (vs just *less overwhelm*) — explained more in "If I had another 4 hours" below.
- **On-road price calculator with city/pincode.** Indian buyers think in on-road terms (~17% above ex-showroom). My ₹14L Brezza vs ₹13L Ertiga comparison is materially misleading without this.
- **Use-intensity question (km/month).** Currently the engine recommends EVs to every fuel-savings buyer, which is wrong below ~1000 km/month.
- **Test-drive booking / dealer locator / next-step CTA.** The shortlist ends at "here are 3 cars." Confident buyers want to *do* something next.
- **LLM-generated review summaries from real sources.** I hand-curated 20 paragraphs that *feel* like review aggregations but aren't actually sourced.
- **Larger dataset (200+ variants).** A real product covers Dzire, Punch, Exter, etc. I kept the dataset small to spend turns on the engine + UX instead.
- **Auth, accounts, profiles.** Out of scope. The shareable-link pattern handles "come back later" without needing accounts.
- **Tests.** Manual smoke testing via API calls. For a brief this size, defensible — but if this were a real codebase I'd add unit tests on the matching engine immediately (the most testable piece, most under-tested).
- **Hindi / regional language support.** Real Indian buyers would benefit; out of scope for the time budget.
- **Image / photo display.** Would need CDN setup, image rights, sizing logic. The match decision genuinely doesn't depend on photos — buyers know what these cars look like.
- **Real owner reviews.** Curated paragraphs ship; scraped real-owner sentences would be more trustworthy.

---

## Tech stack and why

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 App Router** | Only framework with frontend + serverless backend + zero-config Vercel deploy in one. File-based routing, server components, fast iteration. |
| Language | **TypeScript** | Catches shape errors at edit time. Especially valuable for the matching engine where `DimensionScore` / `MatchResult` / `QuizAnswers` flow across module boundaries. |
| Styling | **Tailwind CSS** | Speed-of-iteration on visual design. Zero CSS-naming bikeshedding. |
| Icons | **Lucide React** | Tree-shakes, consistent stroke style, no SVG fiddling. |
| Backend | **Next.js API routes (Node runtime)** | Same framework, same deploy, same TS types between client and server. No separate Express setup. |
| Persistence | **Upstash Redis** via `@upstash/redis` | Only zero-config option that survives across Vercel's serverless function boundaries. Vercel's `/tmp` is isolated per-function and ephemeral; SQLite-on-disk is read-only on Vercel; Upstash REST works from anywhere with no connection pooling concerns. |
| Hosting | **Vercel** | Made by the Next.js team. Zero-config, free tier covers this, git push → live in 60s. |

**What I did *not* pick and why:**

- **No DB ORM (Prisma, Drizzle).** Only one entity (saved shortlist), no relations, no schema migrations. Redis key-value with JSON values is simpler.
- **No LLM / external AI API.** The brief mentioned this as optional and easily-mockable. I went deterministic — every share link produces the same shortlist from the same inputs, no API key, no cost, no flakiness. The "AI" in the product name is honest weighted scoring, not transformer-based generation.
- **No auth (NextAuth, Clerk).** No personalisation that requires identity. Shareable links handle "come back later".
- **No state management library (Redux, Zustand).** A 3-view state machine fits in `useState` cleanly.
- **No test framework.** Time tradeoff — see "What I cut."
- **No Docker.** `npm install && npm run dev` is faster to bootstrap than `docker compose up` for this scope.

---

## What I delegated to AI vs did manually

I (the human) defined scope, made all tech tradeoff decisions when prompted, provisioned Vercel + GitHub + Upstash, and reviewed/approved every change. The AI (Claude Code) wrote essentially all the code under my direction.

### Where AI helped most

- **Dataset generation.** Writing 20 realistic India-market cars with prices, kmpl, bhp/Nm, features lists, pros/cons paragraphs, and review summaries would have taken me a full day to research and write by hand. AI generated a solid first cut in one prompt.
- **Component scaffolds.** Landing, QuizWizard, and ShortlistDashboard each came out as a working ~250-line file in a single turn. Manual would've been 2-3 hours each.
- **The matching engine's TypeScript scaffolding.** Discriminated unions, typed scoring functions, the per-priority averaging logic. AI's "here's a complete first draft" beat iterating in my head.
- **Debugging Vercel's serverless persistence model.** When my first two persistence attempts failed in production, AI ran systematic diagnostic curl-equivalents (3 back-to-back save+page-render attempts) and identified that API routes and page routes deploy as *separate* lambdas with *isolated* `/tmp` directories. That diagnosis would've taken me much longer to reach manually.
- **Tedious refactors.** Renaming `top_priority: Priority` → `top_priorities: Priority[]` across types, engine, validation, quiz UI, and dashboard summary in a single coordinated pass.

### Where AI got in the way

- **First-pass dataset was US cars with MPG and lb-ft torque** despite my brief explicitly saying "India market." 542 lines of Toyota Camry / Tesla Model 3 / Honda Odyssey had to be thrown away and rewritten as Maruti Swift / Tata Nexon / Mahindra XUV700. Sloppy initial prompt-following.
- **Oversold SQLite as "deploys cleanly on Vercel."** Flat wrong — Vercel's project root is read-only at runtime. Cost ~3 round-trips before pivoting to file-store-in-`/tmp`.
- **Then file-store-in-`/tmp` *also* didn't work cross-route** — a second wrong assumption AI should have predicted from Vercel's serverless function model. Cost another round-trip before pivoting to Upstash Redis. The persistence layer took 4 attempts to get right.
- **Over-built decorative chrome.** Animated SVG match-ring, glass-morphism gradients, multi-stop color blends. The brief grades scoping discipline — adding visual flourish is easier than subtracting it, and AI defaults to adding.
- **Default ordering was bottom-up technical** (types → engine → API → UI → polish → deploy) instead of value-first (stub → deploy → validate → polish). The biggest miss of the session: nothing was deployed until I (the human) explicitly asked, three messages in. If I'd walked away after the first turn, the work would have failed the brief's #1 hard constraint ("must run") despite looking complete locally.

The pattern: AI is excellent at *generating* code and *executing prescribed steps*, but defaults to "build more, polish more" rather than "ship the riskiest thing first and validate." I as the human had to course-correct on ordering, dataset localisation, and persistence architecture — none of which the AI flagged proactively.

---

## If I had another 4 hours

Ranked by leverage (highest first):

1. **"Why not X?" per recommendation** (~1 hour). For each top-3 car, surface the 2 closest losers with one sentence on why they lost ("Ertiga ranked #4 — same 7 seats but only 3★ NCAP"). This is the single feature most needed to go from "less overwhelmed" to "confident." Cheap to add: the engine already computes scores for every car, just don't throw them away.

2. **On-road price + city dropdown** (~1 hour). RTO % varies by state (8–10% typical), insurance is ~3% of ex-showroom, dealer handling ~₹15-25k. Even a rough calculator dramatically improves trust because it speaks the buyer's actual language.

3. **Use-intensity question** (~30 min). "How many km/month?" — routes the EV/hybrid recommendations correctly. Currently a 500-km/month buyer gets a Nexon EV recommendation that financially makes no sense.

4. **Unit tests for the matching engine** (~45 min). The engine is the most testable and most under-tested piece. ~8 tests covering individual dimension scorers + 3 persona snapshot tests would prevent regression every time I tune weights.

5. **Validate scoring with real Indian buyers** (~45 min of conversation, not code). Show 5-6 personas' top-3 outputs to people who actually shop for cars in India. The weights I picked are educated guesses. Adversarial feedback would either confirm them or surface obvious mistakes I'm blind to. This is the highest-value missing input to the entire project and the thing I most regret skipping in turn 1.

What I would **not** add even with more time:
- Authentication. Adds complexity without proportional benefit at this scope.
- LLM-generated review summaries. Hand-curated ones are already better than a generic LLM rewrite.
- More cars in the dataset. 20 well-chosen cars covering 6 body styles is enough to make the engine's behaviour testable; doubling it has diminishing returns until "why not X?" exists to use them.

---

## Honest limitations

The headline I wrote — *"Go from 'I don't know' to 'I'm confident'"* — is more aspirational than honest about what this delivers today. The product genuinely reduces overwhelm. It does not deliver decision confidence, because confidence requires:
- **Adversarial reasoning** ("why not X?") — not built
- **Real-world economics** (on-road, fuel breakeven by use intensity) — not built
- **Action handoff** (test drives, dealer contact) — not built

What ships is a meaningfully better-than-CarDekho-filters quiz with personalised explanations. That's a real product. It's just not yet the product the headline promises.

---

## Run it locally (1 command after install)

```bash
npm install
npm run dev
```

Open http://localhost:3000.

> Saving shortlists locally requires Upstash credentials. The app works fully without them — just the "Save & share" button will show an error. To enable persistence locally, fetch real credentials from the Upstash console (linked in your Vercel project's Storage tab) and put them in `.env.local`:
> ```
> KV_REST_API_URL=https://your-instance.upstash.io
> KV_REST_API_TOKEN=your_token_here
> ```

Requires Node.js 18.17+ (Next.js 14). No Docker, no DB setup.

---

## API

### `POST /api/match`
Body:
```json
{
  "household_size": "3-4",
  "primary_use": "road_trips",
  "budget": "20l_35l",
  "top_priorities": ["safety", "fuel_savings"]
}
```
Returns `{ results: MatchResult[], quiz_summary }` — top-3 ranked cars with reasons and spec highlights.

### `POST /api/shortlist`
Body: `{ "response": <MatchResponse> }`. Returns `{ id }`.

### `GET /api/shortlist/[id]`
Returns the saved record, or 404.

### Page `/s/[id]`
Server-rendered view of a saved shortlist. Shareable.

---

## Project structure

```
app/
├── api/match/route.ts           # Matching engine endpoint
├── api/shortlist/route.ts       # Save endpoint
├── api/shortlist/[id]/route.ts  # Retrieve endpoint
├── s/[id]/page.tsx              # Shared shortlist view (SSR)
├── globals.css                  # Tailwind + base styles
├── layout.tsx
└── page.tsx                     # Landing → quiz → results state machine
components/
├── Landing.tsx                  # Hero + flow + dataset strip
├── QuizWizard.tsx               # 4-step interactive form (multi-select on step 4)
└── ShortlistDashboard.tsx       # Top-3 cards + spec grid + Save & Share
data/
└── cars.json                    # 20 India-market 2024 cars
lib/
├── matching.ts                  # Weighted scoring engine
├── store.ts                     # Upstash Redis save/get
├── types.ts                     # Shared TS types
└── utils.ts                     # cn() + formatINR()
```
