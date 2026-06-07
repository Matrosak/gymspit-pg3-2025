import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStats } from "../lib/api";
import { Beer, MapPin, Star, MessageSquare } from "lucide-react";

export default function Stats() {
  const [s, setS] = useState(null);

  useEffect(() => {
    fetchStats().then(setS);
  }, []);

  if (!s) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-stone-500 italic font-serif text-2xl">
        Načítám statistiky…
      </div>
    );
  }

  const maxDist = Math.max(...s.top_districts.map((d) => d.count), 1);
  const maxBeer = Math.max(...s.top_beers.map((b) => b.count), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Pohled na čísla</div>
        <h1 className="font-serif text-5xl text-stone-900 mt-2">Statistiky</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Hospod", val: s.total_pubs, icon: Beer },
          { label: "Čtvrtí", val: s.total_districts, icon: MapPin },
          { label: "Hodnocení", val: s.total_reviews, icon: MessageSquare },
          { label: "Top známka", val: s.top_rated_pubs[0]?.avg?.toFixed(1) || "—", icon: Star },
        ].map((b) => (
          <div key={b.label} className="bg-[#F3F0EA] border border-stone-200 p-6">
            <b.icon className="w-5 h-5 text-amber-700" />
            <div className="font-serif text-4xl text-stone-900 mt-3">{b.val}</div>
            <div className="uppercase text-xs tracking-[0.2em] text-amber-700 mt-1">{b.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <section>
          <h2 className="font-serif text-3xl text-stone-900 mb-6">Hospody podle čtvrtí</h2>
          <div className="space-y-3" data-testid="stats-districts">
            {s.top_districts.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-stone-900">{d.name}</span>
                  <span className="text-stone-600">{d.count}</span>
                </div>
                <div className="h-2 bg-stone-200">
                  <div
                    className="h-full bg-amber-700"
                    style={{ width: `${(d.count / maxDist) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-3xl text-stone-900 mb-6">Nejčastější značky</h2>
          <div className="space-y-3" data-testid="stats-beers">
            {s.top_beers.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-stone-900">{b.name}</span>
                  <span className="text-stone-600">{b.count} hospod</span>
                </div>
                <div className="h-2 bg-stone-200">
                  <div
                    className="h-full bg-stone-900"
                    style={{ width: `${(b.count / maxBeer) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {s.top_rated_pubs.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl text-stone-900 mb-6">Síň slávy</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="stats-top-rated">
            {s.top_rated_pubs.map((p, i) => (
              <Link
                key={p.id}
                to={`/hospody/${p.id}`}
                className="bg-stone-900 text-stone-100 p-5 hover:bg-stone-800 transition-colors flex flex-col"
              >
                <div className="font-serif text-5xl text-amber-400">#{i + 1}</div>
                <div className="font-serif text-lg mt-3 leading-tight">{p.nazev}</div>
                <div className="uppercase text-[10px] tracking-[0.2em] text-amber-400 mt-1">{p.ctvrt}</div>
                <div className="mt-auto pt-3 flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{p.avg.toFixed(1)}</span>
                  <span className="text-stone-400 text-xs">({p.cnt})</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
