import { classifyRegion, classifyRole } from "./classify";
import { boardApiUrl, boardUrl } from "./boards";
import { BoardConfig, CompanyBoardSnapshot, GtmPosting } from "./types";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  updated_at?: string;
  first_published?: string;
}

interface LeverJob {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt?: number;
  categories?: { location?: string; allLocations?: string[] };
}

interface AshbyJob {
  id: string;
  title: string;
  jobUrl: string;
  publishedAt?: string;
  location?: string;
  secondaryLocations?: { location?: string }[];
}

function toGtmPosting(
  id: string,
  title: string,
  location: string,
  url: string,
  publishedAt: string | null
): GtmPosting | null {
  const role = classifyRole(title);
  if (!role) return null;
  return {
    id,
    title,
    location,
    url,
    publishedAt,
    role,
    region: classifyRegion(location),
  };
}

export async function fetchBoardSnapshot(
  config: BoardConfig
): Promise<CompanyBoardSnapshot> {
  const url = boardApiUrl(config.provider, config.token);
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(
      `${config.provider}/${config.token} responded ${res.status}`
    );
  }

  let totalPostings = 0;
  const gtmPostings: GtmPosting[] = [];

  if (config.provider === "greenhouse") {
    const data = (await res.json()) as { jobs: GreenhouseJob[] };
    totalPostings = data.jobs.length;
    for (const job of data.jobs) {
      const posting = toGtmPosting(
        String(job.id),
        job.title,
        job.location?.name ?? "",
        job.absolute_url,
        job.first_published ?? job.updated_at ?? null
      );
      if (posting) gtmPostings.push(posting);
    }
  } else if (config.provider === "lever") {
    const data = (await res.json()) as LeverJob[];
    totalPostings = data.length;
    for (const job of data) {
      const location =
        job.categories?.allLocations?.join(", ") ??
        job.categories?.location ??
        "";
      const posting = toGtmPosting(
        job.id,
        job.text,
        location,
        job.hostedUrl,
        job.createdAt ? new Date(job.createdAt).toISOString() : null
      );
      if (posting) gtmPostings.push(posting);
    }
  } else {
    const data = (await res.json()) as { jobs: AshbyJob[] };
    totalPostings = data.jobs.length;
    for (const job of data.jobs) {
      const posting = toGtmPosting(
        job.id,
        job.title,
        job.location ?? "",
        job.jobUrl,
        job.publishedAt ?? null
      );
      if (posting) gtmPostings.push(posting);
    }
  }

  return {
    provider: config.provider,
    boardToken: config.token,
    boardUrl: boardUrl(config.provider, config.token),
    totalPostings,
    gtmPostings,
  };
}
