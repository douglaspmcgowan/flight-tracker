import { describe, expect, it } from 'vitest';
import {
  BERKELEY_AREA,
  expandDestinationForCity,
  findCityAirportArea,
} from './city-airports';

describe('city airport areas', () => {
  it('maps Berkeley to Oakland and San Francisco', () => {
    expect(findCityAirportArea('Berkeley, California')).toEqual(BERKELEY_AREA);
  });

  it('does not match Berkeley as part of another word', () => {
    expect(findCityAirportArea('Northberkeley')).toBeNull();
  });

  it('replaces a model-selected destination when the raw request names Berkeley', () => {
    const expanded = expandDestinationForCity(
      {
        destination: 'SFO',
        destinationName: 'San Francisco',
        destinations: [{ code: 'SFO', name: 'San Francisco International Airport' }],
      },
      'Norfolk to Berkeley August 14 to 17',
    );

    expect(expanded.destination).toBe('OAK');
    expect(expanded.destinationName).toBe('Berkeley area');
    expect(expanded.destinations).toEqual(BERKELEY_AREA.airports);
  });
});
