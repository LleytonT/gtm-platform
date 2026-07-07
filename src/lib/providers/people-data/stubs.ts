import { PeopleDataProvider } from "./types";

/**
 * Stub adapters for evaluated licensed people-data providers.
 * Each becomes active by implementing getCachedSignals against the vendor's
 * API and setting the corresponding credential env var — no other code
 * changes are required thanks to the adapter interface.
 */
function stub(
  id: string,
  name: string,
  attributionUrl: string,
  envVar: string
): PeopleDataProvider {
  return {
    id,
    name,
    attributionUrl,
    isConfigured: () => Boolean(process.env[envVar]),
    getCachedSignals: () => null,
  };
}

export const coresignalProvider = stub(
  "coresignal",
  "Coresignal",
  "https://coresignal.com",
  "CORESIGNAL_API_KEY"
);

export const peopleDataLabsProvider = stub(
  "pdl",
  "People Data Labs",
  "https://www.peopledatalabs.com",
  "PDL_API_KEY"
);

export const liveDataProvider = stub(
  "live_data",
  "Live Data Technologies",
  "https://www.livedatatechnologies.com",
  "LIVE_DATA_API_KEY"
);

export const harmonicProvider = stub(
  "harmonic",
  "Harmonic",
  "https://harmonic.ai",
  "HARMONIC_API_KEY"
);
