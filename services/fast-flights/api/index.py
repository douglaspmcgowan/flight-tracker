from __future__ import annotations

from datetime import datetime
from typing import Literal

import fast_flights as ff
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Flight Finder cash source", version="1.0.0")

_CABIN_MAP = {
    "economy": "economy",
    "premium_economy": "premium-economy",
    "premium-economy": "premium-economy",
    "business": "business",
    "first": "first",
}


class SearchRequest(BaseModel):
    origin: str = Field(pattern=r"^[A-Z]{3}$")
    destination: str = Field(pattern=r"^[A-Z]{3}$")
    outboundDate: str
    returnDate: str | None = None
    tripType: Literal["one_way", "round_trip"] = "round_trip"
    cabin: str = "economy"
    adults: int = Field(default=1, ge=1, le=9)
    children: int = Field(default=0, ge=0, le=8)
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    maxStops: int | None = Field(default=None, ge=0, le=3)


class PriceData(BaseModel):
    travelDate: str
    price: float
    currency: str
    airline: str
    bookingUrl: str | None = None
    stops: int
    duration: str | None = None
    departureTime: str | None = None
    arrivalTime: str | None = None
    seatsLeft: int | None = None
    flightNumber: str | None = None


class SearchResponse(BaseModel):
    source: str = "fast_flights"
    resultsFound: bool
    currentPrice: str | None = None
    flights: list[PriceData]


def _to_datetime(value: object) -> datetime | None:
    try:
        date = list(value.date)
        time = list(value.time) + [0, 0]
        return datetime(date[0], date[1], date[2], time[0], time[1])
    except (AttributeError, IndexError, TypeError, ValueError):
        return None


def _format_clock(value: object) -> str | None:
    parsed = _to_datetime(value)
    if parsed is None:
        return None
    formatted = parsed.strftime("%I:%M %p")
    return formatted[1:] if formatted.startswith("0") else formatted


def _total_duration(segments: list[object]) -> str | None:
    try:
        total = sum(int(getattr(segment, "duration", 0) or 0) for segment in segments)
        for index in range(len(segments) - 1):
            arrival = _to_datetime(segments[index].arrival)
            departure = _to_datetime(segments[index + 1].departure)
            if arrival and departure and departure > arrival:
                total += int((departure - arrival).total_seconds() // 60)
        return f"{total // 60}h {total % 60}m" if total > 0 else None
    except (AttributeError, TypeError, ValueError):
        return None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "source": "fast_flights"}


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest) -> SearchResponse:
    legs = [
        ff.FlightQuery(
            date=request.outboundDate,
            from_airport=request.origin,
            to_airport=request.destination,
        )
    ]
    trip = "one-way"
    if request.tripType == "round_trip" and request.returnDate:
        legs.append(
            ff.FlightQuery(
                date=request.returnDate,
                from_airport=request.destination,
                to_airport=request.origin,
            )
        )
        trip = "round-trip"

    query = ff.create_query(
        flights=legs,
        seat=_CABIN_MAP.get(request.cabin, "economy"),
        trip=trip,
        passengers=ff.Passengers(adults=request.adults, children=request.children),
        currency=request.currency,
        max_stops=request.maxStops,
    )

    try:
        results = ff.get_flights(query)
    except ff.FlightsNotFound:
        return SearchResponse(resultsFound=False, flights=[])

    flights: list[PriceData] = []
    for item in results:
        segments = list(getattr(item, "flights", []) or [])
        price = getattr(item, "price", None)
        if price is None:
            continue
        airlines = getattr(item, "airlines", None) or []
        flights.append(
            PriceData(
                travelDate=request.outboundDate,
                price=float(price),
                currency=request.currency,
                airline=", ".join(airlines)
                if airlines
                else (getattr(item, "type", None) or "Unknown"),
                stops=max(0, len(segments) - 1),
                duration=_total_duration(segments),
                departureTime=_format_clock(segments[0].departure) if segments else None,
                arrivalTime=_format_clock(segments[-1].arrival) if segments else None,
            )
        )

    current_price = getattr(results, "current_price", None)
    return SearchResponse(
        resultsFound=bool(flights),
        currentPrice=str(current_price) if current_price is not None else None,
        flights=flights,
    )
