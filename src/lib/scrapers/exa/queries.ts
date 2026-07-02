export interface ExaPeopleQuery {
  id: string;
  query: string;
  numResults: number;
}

export function buildPeopleQueries(companyName: string): ExaPeopleQuery[] {
  return [
    {
      id: "aes",
      query: `account executive at ${companyName}`,
      numResults: 30,
    },
    {
      id: "sdrs",
      query: `SDR or BDR at ${companyName}`,
      numResults: 20,
    },
    {
      id: "leadership",
      query: `VP of Sales or Head of Sales at ${companyName}`,
      numResults: 15,
    },
    {
      id: "managers",
      query: `sales manager at ${companyName}`,
      numResults: 15,
    },
    {
      id: "alumni",
      query: `former account executive who worked at ${companyName}`,
      numResults: 15,
    },
  ];
}
