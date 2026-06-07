from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import math
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from collections import Counter

from pubs_data import PUBS, DISTRICT_COORDS, KNOWN_BRANDS, extract_beer_tags


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Pražské Hospody API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ----------------------- Models -----------------------
class Pub(BaseModel):
    id: int
    nazev: str
    ctvrt: str
    pivo: str
    beer_tags: List[str] = []
    lat: float
    lng: float
    avg_rating: float = 0.0
    review_count: int = 0


class ReviewIn(BaseModel):
    pub_id: int
    nickname: str = Field(min_length=1, max_length=40)
    score: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=500)


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pub_id: int
    nickname: str
    score: int
    comment: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ----------------------- Helpers -----------------------
def haversine_km(lat1, lng1, lat2, lng2) -> float:
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _district_jitter(idx: int, ctvrt: str) -> tuple[float, float]:
    """Deterministic small offset so pubs in same district aren't on top of each other."""
    base = DISTRICT_COORDS.get(ctvrt, (50.0875, 14.4213))
    # Spread within ~600 meters
    rng = random.Random(f"{ctvrt}-{idx}")
    dlat = (rng.random() - 0.5) * 0.008
    dlng = (rng.random() - 0.5) * 0.012
    return base[0] + dlat, base[1] + dlng


# Build in-memory pub list (static data – no need to persist in Mongo)
PUB_LIST: list[Pub] = []
for p in PUBS:
    lat, lng = _district_jitter(p["id"], p["ctvrt"])
    PUB_LIST.append(
        Pub(
            id=p["id"],
            nazev=p["nazev"],
            ctvrt=p["ctvrt"],
            pivo=p["pivo"],
            beer_tags=extract_beer_tags(p["pivo"]),
            lat=lat,
            lng=lng,
        )
    )
PUB_BY_ID = {p.id: p for p in PUB_LIST}


async def _enrich_with_ratings(pubs: list[Pub]) -> list[Pub]:
    """Attach avg_rating + review_count from Mongo."""
    ids = [p.id for p in pubs]
    pipeline = [
        {"$match": {"pub_id": {"$in": ids}}},
        {"$group": {"_id": "$pub_id", "avg": {"$avg": "$score"}, "cnt": {"$sum": 1}}},
    ]
    agg = {}
    async for row in db.reviews.aggregate(pipeline):
        agg[row["_id"]] = (round(row["avg"], 2), row["cnt"])
    out = []
    for p in pubs:
        avg, cnt = agg.get(p.id, (0.0, 0))
        out.append(p.model_copy(update={"avg_rating": avg, "review_count": cnt}))
    return out


# ----------------------- Routes -----------------------
@api_router.get("/")
async def root():
    return {"message": "Pražské Hospody API", "pubs": len(PUB_LIST)}


@api_router.get("/pubs", response_model=List[Pub])
async def list_pubs(
    district: Optional[str] = None,
    beer: Optional[str] = None,
    q: Optional[str] = None,
    sort: str = "name",
):
    result = PUB_LIST
    if district:
        result = [p for p in result if p.ctvrt == district]
    if beer:
        bl = beer.lower()
        result = [p for p in result if bl in p.pivo.lower()]
    if q:
        ql = q.lower()
        result = [p for p in result if ql in p.nazev.lower() or ql in p.pivo.lower()]
    result = await _enrich_with_ratings(result)
    if sort == "rating":
        result.sort(key=lambda x: (-x.avg_rating, -x.review_count, x.nazev))
    else:
        result.sort(key=lambda x: x.nazev)
    return result


@api_router.get("/pubs/random", response_model=Pub)
async def random_pub(district: Optional[str] = None, beer: Optional[str] = None):
    pool = PUB_LIST
    if district:
        pool = [p for p in pool if p.ctvrt == district]
    if beer:
        bl = beer.lower()
        pool = [p for p in pool if bl in p.pivo.lower()]
    if not pool:
        raise HTTPException(status_code=404, detail="Žádná hospoda neodpovídá filtru.")
    chosen = random.choice(pool)
    enriched = await _enrich_with_ratings([chosen])
    return enriched[0]


@api_router.get("/pubs/featured", response_model=List[Pub])
async def featured_pubs(limit: int = 6):
    """Top-rated pubs (with at least 1 review). Fallback to random if not enough reviews."""
    enriched = await _enrich_with_ratings(PUB_LIST)
    rated = [p for p in enriched if p.review_count > 0]
    rated.sort(key=lambda x: (-x.avg_rating, -x.review_count))
    if len(rated) >= limit:
        return rated[:limit]
    # Pad with random pubs that aren't already in featured
    chosen_ids = {p.id for p in rated}
    extras = [p for p in enriched if p.id not in chosen_ids]
    random.Random(42).shuffle(extras)
    return (rated + extras)[:limit]


@api_router.get("/pubs/nearest", response_model=List[Pub])
async def nearest_pubs(
    lat: float = Query(...),
    lng: float = Query(...),
    limit: int = 10,
):
    with_dist = [
        (haversine_km(lat, lng, p.lat, p.lng), p) for p in PUB_LIST
    ]
    with_dist.sort(key=lambda x: x[0])
    near = [p for _, p in with_dist[:limit]]
    enriched = await _enrich_with_ratings(near)
    # preserve distance order
    by_id = {p.id: p for p in enriched}
    return [by_id[p.id] for p in near]


@api_router.get("/pubs/{pub_id}", response_model=Pub)
async def get_pub(pub_id: int):
    p = PUB_BY_ID.get(pub_id)
    if not p:
        raise HTTPException(status_code=404, detail="Hospoda nenalezena.")
    enriched = await _enrich_with_ratings([p])
    return enriched[0]


@api_router.get("/districts")
async def list_districts():
    counts = Counter(p.ctvrt for p in PUB_LIST)
    return [
        {
            "name": name,
            "count": counts[name],
            "lat": coords[0],
            "lng": coords[1],
        }
        for name, coords in DISTRICT_COORDS.items()
    ]


@api_router.get("/beers")
async def list_beers():
    """Return all known brand tags with the number of pubs that pour them."""
    counts = Counter()
    for p in PUB_LIST:
        for t in p.beer_tags:
            counts[t] += 1
    return [
        {"name": b, "count": counts.get(b, 0)}
        for b in KNOWN_BRANDS
        if counts.get(b, 0) > 0
    ]


@api_router.get("/stats")
async def stats():
    counts_d = Counter(p.ctvrt for p in PUB_LIST)
    counts_b = Counter()
    for p in PUB_LIST:
        for t in p.beer_tags:
            counts_b[t] += 1
    total_reviews = await db.reviews.count_documents({})
    pipeline = [
        {"$group": {"_id": "$pub_id", "avg": {"$avg": "$score"}, "cnt": {"$sum": 1}}},
        {"$sort": {"avg": -1, "cnt": -1}},
        {"$limit": 5},
    ]
    top = []
    async for row in db.reviews.aggregate(pipeline):
        p = PUB_BY_ID.get(row["_id"])
        if p:
            top.append({
                "id": p.id, "nazev": p.nazev, "ctvrt": p.ctvrt,
                "avg": round(row["avg"], 2), "cnt": row["cnt"],
            })
    return {
        "total_pubs": len(PUB_LIST),
        "total_districts": len(counts_d),
        "total_reviews": total_reviews,
        "top_districts": [{"name": n, "count": c} for n, c in counts_d.most_common()],
        "top_beers": [{"name": n, "count": c} for n, c in counts_b.most_common(10)],
        "top_rated_pubs": top,
    }


@api_router.post("/reviews", response_model=Review)
async def create_review(payload: ReviewIn):
    if payload.pub_id not in PUB_BY_ID:
        raise HTTPException(status_code=404, detail="Hospoda nenalezena.")
    review = Review(**payload.model_dump())
    await db.reviews.insert_one(review.model_dump())
    return review


@api_router.get("/reviews/{pub_id}", response_model=List[Review])
async def list_reviews(pub_id: int):
    docs = await db.reviews.find({"pub_id": pub_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# ----------------------- App wiring -----------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
