export interface ExaPeopleQuery {
  id: string;
  query: string;
  numResults: number;
}

export function buildPeopleQueries(companyName: string): ExaPeopleQuery[] {
  return [
    {
      id: "aes",
      query: `Account Executives at ${companyName}`,
      numResults: 30,
    },
    {
      id: "sdrs",
      query: `SDRs and BDRs at ${companyName}`,
      numResults: 20,
    },
    {
      id: "leadership",
      query: `VP of Sales OR Head of Sales OR CRO at ${companyName}`,
      numResults: 15,
    },
    {
      id: "managers",
      query: `Sales Manager OR Account Executive Manager at ${companyName}`,
      numResults: 15,
    },
    {
      id: "alumni",
      query: `former sales reps and account executives who previously worked at ${companyName}`,
      numResults: 15,
    },
  ];
}
