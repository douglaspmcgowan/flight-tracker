import fast_flights as ff, json
q = ff.create_query(
    flights=[ff.FlightQuery(date="2026-12-10", from_airport="SFO", to_airport="JFK")],
    seat="economy", trip="one-way",
    passengers=ff.Passengers(adults=1), currency="USD",
)
res = ff.get_flights(q)
print("type:", type(res).__name__, "len:", len(res))
for f in list(res)[:3]:
    fields = [a for a in dir(f) if not a.startswith("_")]
    print("FIELDS:", fields)
    print(json.dumps({a: getattr(f, a, None) for a in fields}, default=str))
    print("---")
