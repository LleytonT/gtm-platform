import { exaProvider } from "./exa";
import {
  coresignalProvider,
  harmonicProvider,
  liveDataProvider,
  peopleDataLabsProvider,
} from "./stubs";
import { PeopleDataProvider } from "./types";

export const PEOPLE_DATA_PROVIDERS: PeopleDataProvider[] = [
  exaProvider,
  coresignalProvider,
  peopleDataLabsProvider,
  liveDataProvider,
  harmonicProvider,
];

/**
 * Active provider is selected via PEOPLE_DATA_PROVIDER (defaults to Exa).
 * Swapping vendors is a config change, not a code change.
 */
export function getActivePeopleProvider(): PeopleDataProvider {
  const id = process.env.PEOPLE_DATA_PROVIDER ?? "exa";
  return PEOPLE_DATA_PROVIDERS.find((p) => p.id === id) ?? exaProvider;
}

export type { PeopleDataProvider, PeopleDataSignals } from "./types";
