export interface CityAirport {
  code: string;
  name: string;
}

export interface CityAirportArea {
  id: string;
  city: string;
  label: string;
  airports: CityAirport[];
}

export const BERKELEY_AREA: CityAirportArea = {
  id: 'berkeley-ca',
  city: 'Berkeley',
  label: 'Berkeley area',
  airports: [
    { code: 'OAK', name: 'Oakland International Airport' },
    { code: 'SFO', name: 'San Francisco International Airport' },
  ],
};

const CITY_AREAS = [BERKELEY_AREA] as const;

export function findCityAirportArea(input: string): CityAirportArea | null {
  const normalized = input.trim().toLocaleLowerCase('en-US');
  return CITY_AREAS.find((area) => {
    const city = area.city.toLocaleLowerCase('en-US');
    return new RegExp(`\\b${city}\\b`, 'i').test(normalized);
  }) ?? null;
}

export function expandDestinationForCity<
  T extends {
    destination: string;
    destinationName: string;
    destinations: CityAirport[];
  },
>(query: T, rawInput: string): T {
  const area = findCityAirportArea(rawInput);
  if (!area) return query;

  return {
    ...query,
    destination: area.airports[0]!.code,
    destinationName: area.label,
    destinations: area.airports.map((airport) => ({ ...airport })),
  };
}
