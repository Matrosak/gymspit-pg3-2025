import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "../lib/storage";
import { fetchPub } from "../lib/api";
import PubCard from "../components/PubCard";
import { Heart } from "lucide-react";

export default function Favorites() {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getFavorites();
    Promise.all(ids.map((id) => fetchPub(id).catch(() => null))).then((list) => {
      setPubs(list.filter(Boolean));
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Tvůj výběr</div>
        <h1 className="font-serif text-5xl text-stone-900 mt-2">Oblíbené hospody</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Hospody, které sis označil srdíčkem. Ukládají se v tomto prohlížeči.
        </p>
      </div>

      {loading ? (
        <p className="text-stone-500 italic">Načítám…</p>
      ) : pubs.length === 0 ? (
        <div className="border-2 border-dashed border-stone-300 p-16 text-center">
          <Heart className="w-10 h-10 text-amber-700 mx-auto mb-4" />
          <p className="font-serif text-2xl text-stone-900">Žádné oblíbené hospody.</p>
          <p className="text-stone-600 mt-2">Klikni na srdíčko u libovolné hospody.</p>
          <Link
            to="/hospody"
            data-testid="fav-empty-browse"
            className="mt-6 inline-block bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 border border-amber-900 transition-colors"
          >
            Procházet hospody
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="favorites-grid">
          {pubs.map((p, i) => (
            <PubCard key={p.id} pub={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
