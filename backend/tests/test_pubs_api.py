"""Backend API tests for Pražské Hospody."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gallant-ptolemy-10.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    d = r.json()
    assert d["pubs"] == 143


def test_list_pubs_all(s):
    r = s.get(f"{API}/pubs")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 143
    p = data[0]
    for k in ["id", "nazev", "ctvrt", "pivo", "beer_tags", "lat", "lng", "avg_rating", "review_count"]:
        assert k in p


def test_list_pubs_by_district(s):
    r = s.get(f"{API}/pubs", params={"district": "Žižkov"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 10
    assert all(p["ctvrt"] == "Žižkov" for p in data)


def test_list_pubs_by_beer(s):
    r = s.get(f"{API}/pubs", params={"beer": "Pilsner Urquell"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert all("pilsner urquell" in p["pivo"].lower() for p in data)


def test_list_pubs_by_q(s):
    r = s.get(f"{API}/pubs", params={"q": "Zlatého"})
    assert r.status_code == 200
    names = [p["nazev"] for p in r.json()]
    assert any("Zlatého tygra" in n for n in names)


def test_list_pubs_sort_rating(s):
    r = s.get(f"{API}/pubs", params={"sort": "rating"})
    assert r.status_code == 200
    data = r.json()
    ratings = [p["avg_rating"] for p in data]
    assert ratings == sorted(ratings, reverse=True)


def test_random_pub(s):
    r = s.get(f"{API}/pubs/random")
    assert r.status_code == 200
    assert "id" in r.json()


def test_random_pub_district(s):
    r = s.get(f"{API}/pubs/random", params={"district": "Žižkov"})
    assert r.status_code == 200
    assert r.json()["ctvrt"] == "Žižkov"


def test_featured(s):
    r = s.get(f"{API}/pubs/featured", params={"limit": 6})
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_nearest(s):
    r = s.get(f"{API}/pubs/nearest", params={"lat": 50.0875, "lng": 14.4213, "limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    # Praha 1 coords should yield Praha 1 first
    assert data[0]["ctvrt"] == "Praha 1"


def test_pub_by_id(s):
    r = s.get(f"{API}/pubs/1")
    assert r.status_code == 200
    assert r.json()["id"] == 1


def test_pub_404(s):
    r = s.get(f"{API}/pubs/99999")
    assert r.status_code == 404


def test_districts(s):
    r = s.get(f"{API}/districts")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 14
    for d in data:
        for k in ["name", "count", "lat", "lng"]:
            assert k in d


def test_beers(s):
    r = s.get(f"{API}/beers")
    assert r.status_code == 200
    beers = {b["name"]: b["count"] for b in r.json()}
    assert beers.get("Pilsner Urquell", 0) > 0
    assert beers.get("Kozel", 0) > 0


def test_stats(s):
    r = s.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    assert d["total_pubs"] == 143
    assert d["total_districts"] == 14
    for k in ["total_reviews", "top_districts", "top_beers", "top_rated_pubs"]:
        assert k in d


def test_review_create_and_fetch(s):
    payload = {"pub_id": 1, "nickname": "TEST_pivař", "score": 5, "comment": "TEST review"}
    r = s.post(f"{API}/reviews", json=payload)
    assert r.status_code == 200
    rev = r.json()
    assert rev["score"] == 5
    # fetch
    r2 = s.get(f"{API}/reviews/1")
    assert r2.status_code == 200
    assert any(x["nickname"] == "TEST_pivař" for x in r2.json())
    # pub now shows avg
    r3 = s.get(f"{API}/pubs/1")
    assert r3.json()["review_count"] >= 1
    assert r3.json()["avg_rating"] > 0


def test_review_invalid_pub(s):
    r = s.post(f"{API}/reviews", json={"pub_id": 99999, "nickname": "x", "score": 3, "comment": ""})
    assert r.status_code == 404


def test_review_score_validation(s):
    r1 = s.post(f"{API}/reviews", json={"pub_id": 1, "nickname": "x", "score": 6, "comment": ""})
    r2 = s.post(f"{API}/reviews", json={"pub_id": 1, "nickname": "x", "score": 0, "comment": ""})
    assert r1.status_code == 422
    assert r2.status_code == 422
