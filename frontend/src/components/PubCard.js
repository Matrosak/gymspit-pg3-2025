import { Link } from "react-router-dom";
import { Heart, Plus, MapPin, Star } from "lucide-react";
import { isFavorite, toggleFavorite, addToCrawl } from "../lib/storage";
import { toast } from "sonner";
import { useState } from "react";

export default function PubCard({ pub, index = 0, featured = false }) {
  const [fav, setFav] = useState(isFavorite(pub.id));

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const list = toggleFavorite(pub.id);
    const isNow = list.includes(pub.id);
    setFav(isNow);
    toast.success(isNow ? "Přidáno do oblíbených" : "Odebráno z oblíbených");
  };

  const handleCrawl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCrawl(pub.id);
    toast.success(`„${pub.nazev}“ přidáno do hospodského tahu`);
  };

  const tags = (pub.beer_tags || []).slice(0, 4);

  return (
    <Link
      to={`/hospody/${pub.id}`}
      data-testid={`pub-card-${pub.id}`}
      className={`group relative block bg-[#F3F0EA] border border-stone-200/60 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-4 ${
        featured ? "ring-1 ring-amber-300" : ""
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {featured && (
        <div className="absolute -top-3 left-4 bg-amber-700 text-white text-[10px] uppercase tracking-[0.2em] px-2 py-1 font-sans">
          Doporučeno
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {pub.ctvrt}
          </div>
          <h3 className="font-serif text-2xl text-stone-900 mt-1 leading-tight">
            {pub.nazev}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleFav}
          data-testid={`favorite-btn-${pub.id}`}
          aria-label="Oblíbené"
          className="text-stone-400 hover:text-amber-700 transition-colors p-1"
        >
          <Heart
            className={`w-5 h-5 ${fav ? "fill-amber-700 text-amber-700" : ""}`}
          />
        </button>
      </div>

      <p className="text-sm text-stone-700 leading-relaxed line-clamp-3">{pub.pivo}</p>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="bg-amber-100/60 text-amber-900 text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold border border-amber-200/60"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-stone-200/70">
        <div className="flex items-center gap-1 text-sm text-stone-700">
          {pub.review_count > 0 ? (
            <>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="font-semibold">{pub.avg_rating.toFixed(1)}</span>
              <span className="text-stone-500 text-xs">({pub.review_count})</span>
            </>
          ) : (
            <span className="text-stone-400 text-xs italic">Bez hodnocení</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCrawl}
          data-testid={`add-crawl-btn-${pub.id}`}
          className="text-xs uppercase tracking-wider text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Do tahu
        </button>
      </div>
    </Link>
  );
}
