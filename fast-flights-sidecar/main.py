"""fast-flights sidecar for flight-finder.

A thin FastAPI wrapper around the `fast-flights` library (keyless Google Flights
Protobuf decode — no browser, no LLM). Exposes POST /search returning fares
normalized to flight-finder's `PriceData` shape so the Next.js app can register
it as a `fast_flights` navigation source alongside the Playwright path.

Run: venv/Scripts/uvicorn main:app --host 127.0.0.1 --port 8123
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

import fast_flights as ff
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="fast-flights sidecar", version="0.1.0")

Cabin = Literal["economy", "premium-economy", "business", "first"]

# flight-finder uses "economy" | "premium_economy" | "business" | "first";
# fast-flights uses hyphens. Normalize inbound.
_CABIN_MAP = {
    "economy": "economy",
    "premium_economy": "premium-economy",
    "premium-economy": "premium-economy",
    "business": "business",
    "first": "first",
}


class SearchRequest(BaseModel):
    origin: str = Field(..., min_length=3, max_length=3)
    destination: str = Field(..., min_length=3, max_length=3)
    outboundDate: str  # ISO YYYY-MM-DD
    returnDate: Optional[str] = None
    tripType: Literal["one_way", "round_trip"] = "round_trip"
    cabin: str = "economy"
    adults: int = 1
    children: int = 0
    currency: str = "USD"
    maxStops: Optional[int] = None


class PriceData(BaseModel):
    travelDate: str
    price: float
    currency: str
    airline: str
    bookingUrl: Optional[str] = None
    stops: int
    duration: Optional[str] = None
    departureTime: Optional[str] = None
    arrivalTime: Optional[str] = None
    seatsLeft: Optional[int] = None
    flightNumber: Optional[str] = None


class SearchResponse(BaseModel):
    source: str = "fast_flights"
    resultsFound: bool
    currentPrice: Optional[str] = None
    flights: list[PriceData]


def _to_dt(sd) -> Optional[datetime]:
    """SimpleDatetime(date=[y,m,d], time=[h] or [h,m]) -> datetime (naive, local)."""
    try:
        d = list(sd.date)
        t = list(sd.time) + [0, 0]
        return datetime(d[0], d[1], d[2], t[0], t[1])
    except Exception:
        return None


def _fmt_clock(sd) -> Optional[str]:
    dt = _to_dt(sd)
    if not dt:
        return None
    # "%-I" isn't portable on Windows; strip a leading zero manually.
    s = dt.strftime("%I:%M %p")
    return s[1:] if s.startswith("0") else s


def _total_duration(segments) -> Optional[str]:
    """Elapsed = sum(segment flight minutes) + sum(layovers).

    Layovers are computed as naive local diffs between a segment's arrival and
    the next segment's departure — valid because both are at the same airport
    (same timezone). Summing flight minutes (already tz-correct per segment)
    avoids the cross-timezone error a naive first-departure-to-last-arrival
    diff would introduce.
    """
    try:
        total = 0
        for seg in segments:
            total += int(getattr(seg, "duration", 0) or 0)
        for i in range(len(segments) - 1):
            a = _to_dt(segments[i].arrival)
            d = _to_dt(segments[i + 1].departure)
            if a and d and d > a:
                total += int((d - a).total_seconds() // 60)
        if total <= 0:
            return None
        return f"{total // 60}h {total % 60}m"
    except Exception:
        return None


@app.get("/health")
def health():
    return {"status": "ok", "source": "fast_flights"}


@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest) -> SearchResponse:
    seat = _CABIN_MAP.get(req.cabin, "economy")
    legs = [ff.FlightQuery(date=req.outboundDate, from_airport=req.origin, to_airport=req.destination)]
    trip = "one-way"
    if req.tripType == "round_trip" and req.returnDate:
        legs.append(ff.FlightQuery(date=req.returnDate, from_airport=req.destination, to_airport=req.origin))
        trip = "round-trip"

    query = ff.create_query(
        flights=legs,
        seat=seat,
        trip=trip,
        passengers=ff.Passengers(adults=max(1, req.adults), children=req.children),
        currency=req.currency,
        max_stops=req.maxStops,
    )

    try:
        results = ff.get_flights(query)
    except ff.FlightsNotFound:
        return SearchResponse(resultsFound=False, flights=[])

    current_price = getattr(results, "current_price", None)
    out: list[PriceData] = []
    for item in results:
        segs = list(getattr(item, "flights", []) or [])
        airlines = getattr(item, "airlines", None) or []
        airline = ", ".join(airlines) if airlines else (getattr(item, "type", None) or "Unknown")
        price = getattr(item, "price", None)
        if price is None:
            continue  # a price-less row (e.g. "price unavailable") is not a trackable fare
        dep = _fmt_clock(segs[0].departure) if segs else None
        arr = _fmt_clock(segs[-1].arrival) if segs else None
        out.append(
            PriceData(
                travelDate=req.outboundDate,
                price=float(price),
                currency=req.currency,
                airline=airline,
                bookingUrl=None,  # fast-flights does not expose a booking URL
                stops=max(0, len(segs) - 1),
                duration=_total_duration(segs),
                departureTime=dep,
                arrivalTime=arr,
                seatsLeft=None,   # not exposed by the Protobuf feed
                flightNumber=None,
            )
        )

    return SearchResponse(
        resultsFound=len(out) > 0,
        currentPrice=str(current_price) if current_price is not None else None,
        flights=out,
    )
