import type { ExaPerson, ExaSearchResponse, ExaWorkRole } from "./types";

function parseWorkHistory(
  history: NonNullable<
    NonNullable<ExaSearchResponse["results"]>[number]["entities"]
  >[number]["properties"]
): ExaWorkRole[] {
  if (!history?.workHistory?.length) return [];

  return history.workHistory
    .map((role) => ({
      title: role.title?.trim() ?? "Unknown role",
      companyName: role.company?.name?.trim() ?? "",
      location: role.location?.trim() ?? null,
      from: role.dates?.from ?? null,
      to: role.dates?.to ?? null,
    }))
    .filter((role) => role.companyName.length > 0);
}

export function parsePersonFromResult(
  row: NonNullable<ExaSearchResponse["results"]>[number]
): ExaPerson | null {
  const entity = row.entities?.find((e) => e.type === "person");
  const props = entity?.properties;
  if (!props) return null;

  const name =
    props.name?.trim() ??
    [props.firstName, props.lastName].filter(Boolean).join(" ").trim();
  if (!name) return null;

  return {
    name,
    profileUrl: row.url ?? "",
    location: props.location?.trim() ?? null,
    workHistory: parseWorkHistory(props),
  };
}

export function dedupePeople(people: ExaPerson[]): ExaPerson[] {
  const seen = new Map<string, ExaPerson>();

  for (const person of people) {
    const key =
      person.profileUrl.replace(/\/$/, "").toLowerCase() ||
      person.name.toLowerCase();
    const existing = seen.get(key);
    if (!existing || person.workHistory.length > existing.workHistory.length) {
      seen.set(key, person);
    }
  }

  return [...seen.values()];
}
