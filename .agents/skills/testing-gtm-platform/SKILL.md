---
name: testing-gtm-platform
description: Test the GTM Hire platform end-to-end. Use when verifying UI changes, data accuracy, or interactive features across the company directory, outreach builder, and scenario plays pages.
---

# Testing GTM Hire Platform

## Prerequisites

- Node.js 18+ installed
- Run `npm install` in the repo root
- Start dev server: `npm run dev` (runs on localhost:3000)
- Verify server is up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` should return 200

## Key Pages to Test

| Page | URL | Type |
|------|-----|------|
| Landing | `/` | Server Component |
| Company Directory | `/companies` | Client Component (search/filter/sort state) |
| Company Detail | `/companies/[slug]` | Server Component with `generateStaticParams` |
| Outreach Builder | `/outreach` | Client Component wrapped in Suspense (uses `useSearchParams`) |
| Scenario Plays | `/scenarios` | Client Component wrapped in Suspense (uses `useSearchParams`) |

## Seed Data Reference

- **8 companies**: datadog, gong, rippling, notion, clay, vanta, figma, mercury
- **Top 4 by Overall Score**: Datadog (92), Figma (91), Rippling (90), Gong (88)
- **Highest growth**: Clay (300%+ YoY), Rippling (100%+ YoY)
- **6 scenarios**: 2 beginner (Rippling, Vanta), 2 intermediate (Datadog, Clay), 2 advanced (Gong, Figma)
- Data source: `src/lib/data.ts`

## Test Strategy

### 1. Landing Page
- Verify hero text and CTA buttons
- Scroll to "Top-rated companies" section and confirm top 4 cards match seed data scores
- Click "Browse Companies" to navigate to `/companies`

### 2. Company Directory (Interactive)
- **Search**: Type a company name (e.g. "datadog") and verify filtered count updates
- **Industry filter**: Select a specific industry and verify only matching companies appear
- **Sort**: Change sort to "Growth Rate" and verify Clay appears first (300%+ YoY)
- **Clear filters**: Click clear and verify all 8 companies return

### 3. Company Detail
- Navigate to `/companies/datadog` and verify all data sections:
  - Financials: revenue, growth rate, funding, investors
  - PMF: NPS, retention, market growth, competitive position, signals list
  - Comp: base salary, OTE, equity, quota, benefits
  - Sidebar: hiring roles, GTM team size, quick action buttons
- Verify "Build Outreach" links to `/outreach?company=datadog`

### 4. Outreach Builder (Interactive)
- Navigate via company detail "Generate Outreach" button to verify `?company=` param pre-selects
- Verify Company Intel sidebar shows correct metrics
- Fill in Target Role and Hiring Manager fields — template should update reactively
- Switch between Email, LinkedIn, and Referral Ask tabs
- LinkedIn tab should show character count and warn if over 300 chars

### 5. Scenario Plays (Interactive)
- Verify 6 scenarios badge
- Test difficulty filter (Beginner should show 2 scenarios)
- Expand a scenario card and verify all 4 sections: Objectives, Key Talking Points, Common Objections, Success Criteria
- Verify action buttons link correctly to company detail and outreach pages

### 6. Cross-Page Navigation
- Test nav links (Companies, Outreach, Scenario Plays) highlight correctly
- Test logo returns to home
- Test company detail -> outreach -> scenarios flow via quick action buttons

## Common Issues

- **Next.js dev overlay**: The "N Issues" badge in bottom-left is the Next.js development error overlay showing hydration warnings. These are not visible in production builds and can be dismissed by clicking the X.
- **Suspense boundaries**: Outreach and Scenarios pages use `useSearchParams()` which requires Suspense wrapping. If these pages show a blank state, check that the Suspense boundary is properly wrapping the component that calls `useSearchParams()`.
- **Company logos**: Logo images load from `logo.clearbit.com` — if they fail, the fallback letter avatar should display instead.
- **No CI configured**: This is a fresh repo with no CI pipeline. Verify builds pass locally with `npm run build` and `npm run lint`.

## Devin Secrets Needed

None required for testing this application.
