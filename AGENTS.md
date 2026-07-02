<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`gtm-platform` ("GTM Hire") is a single Next.js 16 (App Router, React 19, Tailwind v4) app — no backend, database, API routes, or environment variables. All content is static TypeScript in `src/lib/` (`data.ts`, `three-ts.ts`, `research-*.ts`). Package manager is npm (`package-lock.json`).

Standard commands are in `package.json`: `npm run dev` (dev server, port 3000), `npm run build`, `npm run start`, `npm run lint`. The update script already runs `npm install` on startup.

Non-obvious notes:
- Company logos load from `logo.clearbit.com` and fonts from Google Fonts (`next/font/google`, fetched at build). These are the only network touches; they are non-blocking for core functionality but logos/fonts may not render if the VM has no outbound network.
- Core user flow to verify changes end-to-end: `/companies` (client-side search / industry+region filters / sort / "Gravy train only" toggle in `companies/companies-client.tsx`) → open a company detail page `/companies/[slug]` (SSG) showing the Three T's scoring breakdown.
