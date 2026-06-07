# Pražské Hospody — PRD

## Original Problem
User provided a static C# seed list of ~143 Prague pubs across 14 districts (Praha 1, Prosek, Ládví, Kobylisy, Střížkov, Letňany, Žižkov, Vinohrady, Karlín, Dejvice, Smíchov, Nusle, Holešovice, Břevnov). Each pub: `Id, Nazev, Ctvrt, Pivo`. They want a Czech-language web app that:

1. Tells you where to go for a specific kind of beer
2. Finds pubs near the user (district + GPS)
3. Adds 2+ extra functions (we implemented all 5 suggested)
4. Lets customers submit a 1–5 rating
5. Promotes pubs with better reviews more prominently

## User Choices (Feb 2026)
- Web app (React + FastAPI + Mongo)
- Nearest = browser GPS **AND** district filter
- Extra features: random picker, beer filter, crawl planner, favorites, statistics (all 5)
- Reviews: nickname only, no registration
- Language: Czech

## Architecture
- **Backend (FastAPI)**: 143 pubs as in-memory seed (`pubs_data.py`). District GPS centroids + deterministic jitter per pub. Reviews stored in MongoDB `reviews` collection. Aggregation pipeline computes avg rating + count for "featured" boost. All routes prefixed `/api`.
- **Frontend (React 19 + Tailwind + shadcn)**: 7 routes — `/`, `/hospody`, `/hospody/:id`, `/blizko`, `/tah`, `/oblibene`, `/statistiky`. Favorites & crawl persisted in `localStorage`. Sonner toasts. Cormorant Garamond + Manrope fonts.
- **Design**: Editorial "Organic & Earthy" — amber/copper, hop green, off-white paper, charcoal. No purple gradients.

## What's Been Implemented (Feb 2026)
- ✅ 143 pubs seeded, 14 districts with GPS centroids
- ✅ `/api/pubs` with `district`, `beer`, `q`, `sort=name|rating` filters
- ✅ `/api/pubs/random`, `/featured`, `/nearest` (haversine), `/{id}`
- ✅ `/api/districts`, `/api/beers` (44 brands extracted), `/api/stats`
- ✅ `/api/reviews` POST (1–5 + nickname + comment, with validation) and GET per pub
- ✅ Promotion: featured endpoint surfaces top-rated pubs first; PubCard renders an amber "Doporučeno" badge for rated pubs
- ✅ Home: hero with slot-machine "Kam dnes na pivo?" picker, district marquee, featured grid, CTA strip
- ✅ Directory: search + district/beer chip filters + sort + grouped-by-district view
- ✅ Pub detail: rating form (with stars), reviews list, beer tag links back to filter
- ✅ Nearest: GPS button + district picker
- ✅ Crawl planner: localStorage list with up/down/remove/clear, numbered timeline
- ✅ Favorites: localStorage-backed grid
- ✅ Stats: total counters, district & beer bar charts, top-rated "Síň slávy"

## Test Status
- Backend: 18/18 endpoints passed (testing_agent_v3 iteration_1)
- Frontend: All main flows verified by testing_agent_v3

## Next Action Items (P1/P2 backlog)
- **P1**: Real street addresses + interactive Leaflet/Mapbox map instead of district centroids
- **P1**: Share-a-crawl via URL (encode pub ids in query string)
- **P2**: Photo uploads per review (object storage)
- **P2**: Owner/staff dashboard for pubs to claim listings & respond to reviews
- **P2**: Open/closed hours per pub
- **P2**: Filter by rating threshold ("≥ 4 stars only")
- **P2**: Czech "pivní deník" — track which pubs the user already visited
