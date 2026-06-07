import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPubs, fetchDistricts, fetchBeers } from "../lib/api";
import PubCard from "../components/PubCard";
import { Search, X } from "lucide-react";

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pubs, setPubs] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");

  const district = searchParams.get("district") || "";
  const beer = searchParams.get("beer") || "";
  const q = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    fetchDistricts().then(setDistricts);
    fetchBeers().then(setBeers);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPubs({
      district: district || undefined,
      beer: beer || undefined,
      q: q || undefined,
      sort,
    }).then((data) => {
      setPubs(data);
      setLoading(false);
    });
  }, [district, beer, q, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const grouped = useMemo(() => {
    const out = {};
    for (const p of pubs) {
      if (!out[p.ctvrt]) out[p.ctvrt] = [];
      out[p.ctvrt].push(p);
    }
    return out;
  }, [pubs]);

  const hasFilter = district || beer || q;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Adresář</div>
        <h1 className="font-serif text-5xl text-stone-900 mt-2">Pražské hospody</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Procházej kompletní seznam hospod podle čtvrti nebo značky piva. Filtruj, hledej, oblíbej si.
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", searchInput);
        }}
        className="mb-8 flex items-center gap-3 border-b-2 border-stone-300 focus-within:border-amber-700 transition-colors"
      >
        <Search className="w-5 h-5 text-stone-500" />
        <input
          data-testid="directory-search-input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Hledat hospodu nebo pivo…"
          className="flex-1 bg-transparent py-3 outline-none text-stone-900 font-sans placeholder:text-stone-400"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              updateParam("q", "");
            }}
            data-testid="directory-search-clear"
            className="text-stone-500 hover:text-stone-900"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Filters */}
        <aside className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="uppercase text-xs tracking-[0.2em] text-amber-700">Čtvrť</h3>
              {district && (
                <button
                  onClick={() => updateParam("district", "")}
                  data-testid="clear-district-btn"
                  className="text-xs text-stone-500 hover:text-amber-800"
                >
                  Zrušit
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <button
                  key={d.name}
                  onClick={() => updateParam("district", district === d.name ? "" : d.name)}
                  data-testid={`filter-district-${d.name}`}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    district === d.name
                      ? "bg-amber-700 text-white border-amber-800"
                      : "bg-transparent border-stone-300 text-stone-700 hover:border-amber-700 hover:text-amber-800"
                  }`}
                >
                  {d.name} <span className="opacity-60">({d.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="uppercase text-xs tracking-[0.2em] text-amber-700">Pivovar / značka</h3>
              {beer && (
                <button
                  onClick={() => updateParam("beer", "")}
                  data-testid="clear-beer-btn"
                  className="text-xs text-stone-500 hover:text-amber-800"
                >
                  Zrušit
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-2">
              {beers.map((b) => (
                <button
                  key={b.name}
                  onClick={() => updateParam("beer", beer === b.name ? "" : b.name)}
                  data-testid={`filter-beer-${b.name}`}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    beer === b.name
                      ? "bg-amber-700 text-white border-amber-800"
                      : "bg-amber-100/40 border-amber-200/60 text-amber-900 hover:border-amber-700"
                  }`}
                >
                  {b.name} <span className="opacity-60">({b.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="uppercase text-xs tracking-[0.2em] text-amber-700 mb-3">Řazení</h3>
            <div className="flex gap-2">
              {[
                { v: "name", l: "Abeceda" },
                { v: "rating", l: "Hodnocení" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setSort(o.v)}
                  data-testid={`sort-${o.v}`}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    sort === o.v
                      ? "bg-stone-900 text-white border-stone-900"
                      : "border-stone-300 text-stone-700 hover:border-amber-700"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-stone-600" data-testid="directory-count">
              {loading ? "Načítám…" : `${pubs.length} hospod`}
              {hasFilter ? " · filtrováno" : ""}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : sort === "rating" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pubs.map((p, i) => (
                <PubCard key={p.id} pub={p} index={i} featured={p.review_count > 0} />
              ))}
            </div>
          ) : (
            <div className="space-y-14">
              {Object.entries(grouped).map(([ctvrt, items]) => (
                <div key={ctvrt}>
                  <div className="flex items-baseline justify-between mb-5 border-b border-stone-200 pb-2">
                    <h2 className="font-serif text-3xl text-stone-900">{ctvrt}</h2>
                    <span className="uppercase text-[10px] tracking-[0.2em] text-amber-700">
                      {items.length} hospod
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((p, i) => (
                      <PubCard key={p.id} pub={p} index={i} />
                    ))}
                  </div>
                </div>
              ))}
              {pubs.length === 0 && (
                <div className="text-center text-stone-500 py-16 italic font-serif text-2xl">
                  Žádná hospoda nesplňuje filtr.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
