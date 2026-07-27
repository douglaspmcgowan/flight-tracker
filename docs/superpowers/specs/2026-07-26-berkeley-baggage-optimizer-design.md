# Berkeley Baggage Optimizer Design

**Status:** Approved for inline implementation by Douglas on 2026-07-26.

## Goal

Make Flight Finder rank Norfolk-to-Berkeley cash itineraries for August 14–17, 2026 by the total cost for two travelers with four checked bags, while respecting a maximum of one or two stops and the two plausible meanings of “Delta Platinum.”

## User workflow

1. Open the manual cash-flight search.
2. Choose Norfolk (ORF).
3. Choose the Berkeley area preset. Flight Finder expands it to Oakland (OAK) and San Francisco (SFO) and previews both routes.
4. Enter August 14 and August 17, 2026.
5. Set two travelers, four collective checked bags, a one- or two-stop ceiling, and the relevant Delta benefit preset.
6. Select flights to track.
7. On each route, inspect a total-trip-cost comparison that shows airfare, estimated round-trip checked-bag fees, and total.
8. Adjust the traveler, bag, or benefit assumptions from the tracker page; the change cascades to every sibling route in the search.

## Cost model

`total = per-person round-trip fare × traveler count + checked-bag fees for each direction`

Collective bags are distributed as evenly as possible across travelers because carrier fees are assessed per passenger and by bag ordinal. For two travelers and four bags, each traveler is assigned two bags.

The fee engine:

- matches the operating airline name to a dated, source-backed domestic fee schedule;
- applies the selected benefit only to eligible Delta-operated results;
- returns an explicit “fee unavailable” state for unsupported carriers;
- never substitutes a guessed fee;
- exposes the source and review date in the UI.

Benefit presets:

- `none`: standard carrier fee schedule.
- `delta_platinum_amex`: first checked bag free for both travelers on the same reservation; the second checked bag is free for the cardmember only on eligible domestic Delta-operated flights.
- `delta_platinum_medallion`: up to three checked bags free for each traveler on the same reservation on eligible domestic Delta-operated flights.

For the exact two-traveler/four-bag round trip, the Delta Platinum AmEx preset estimates $110 in bag fees at the current $55 second-bag fee. The Platinum Medallion preset estimates $0. The UI labels both assumptions so Douglas can select the benefit his mom actually has.

## Persisted data

Each `Query` stores:

- `travelerCount` — integer 1–9, default 1.
- `checkedBagCount` — collective standard checked bags per direction, integer 0–18, default 0.
- `baggageBenefit` — one of `none`, `delta_platinum_amex`, or `delta_platinum_medallion`.

Sibling queries created by the same multi-airport search receive identical values. Tracker edits cascade across the group.

## Airport expansion

The first deterministic city-area map contains:

- Berkeley, California → OAK (Oakland International Airport) and SFO (San Francisco International Airport).

The manual form presents this as an explicit preset. Natural-language parsing also recognizes Berkeley in the user’s raw input and applies the same map after the model response is normalized.

## Boundaries

- Standard-sized, standard-weight checked bags only.
- Domestic itineraries only for this fee model.
- Bag fees are estimates and are verified against the airline before purchase.
- Codeshare and partner-operated flights may use another carrier’s policy; the app warns about this.
- Fare-brand-specific free bags, military benefits, and unrelated airline-card benefits remain outside this delivery.
- Live seats.aero award results still require a seats.aero API key and are independent of cash baggage totals.

## Source register

Reviewed 2026-07-26:

- Delta standard and card benefits: https://www.delta.com/us/en/baggage/checked-baggage/first-checked-bag-free
- Delta Medallion allowance: https://www.delta.com/us/en/baggage/checked-baggage/medallion-baggage-allowance
- Southwest fees: https://www.southwest.com/html/customer-service/travel-fees.html
- Alaska fees: https://news.alaskaair.com/page/6/?_hsmi=12877383&edition=starter&gh_jid=648106&term=monthly
- American fees: https://news.aa.com/news/news-details/2026/American-Airlines-updates-bag-fees-and-Basic-Economy-fares-OPS-POL-04/default.aspx
- JetBlue fees and August peak dates: https://www.jetblue.com/legal/fees
- United standard-fee values disclosed through card benefits: https://cardmembers.united.com/Quest
