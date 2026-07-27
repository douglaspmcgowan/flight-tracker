interface FlightIdentityInput {
  airline: string;
  flightNumber?: string | null;
  departureTime?: string | null;
  origin: string;
  destination: string;
  travelDate: string;
}

export function buildFlightId({
  airline,
  flightNumber,
  departureTime,
  origin,
  destination,
  travelDate,
}: FlightIdentityInput): string | null {
  const airlinePart = airline.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'Unknown';
  const flightNumberPart = (flightNumber ?? '').replace(/\s+/g, '').toUpperCase();
  const timePart = (departureTime ?? '').replace(/[^0-9]/g, '');
  const identity = flightNumberPart || timePart;
  if (!identity) return null;
  return `${airlinePart}-${identity}-${origin}-${destination}-${travelDate}`;
}
