/**
 * CLI wrapper around the job-board refresh pipeline.
 *
 * Usage: npm run scrape:jobs
 * Scheduled: daily via /api/cron/refresh-jobs (see vercel.json).
 */
import { refreshJobBoards } from "../src/lib/jobs/refresh";

refreshJobBoards().catch((err) => {
  console.error(err);
  process.exit(1);
});
