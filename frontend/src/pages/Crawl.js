import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPub } from "../lib/api";
import { getCrawl, removeFromCrawl, reorderCrawl, clearCrawl } from "../lib/storage";
import { Trash2, ArrowUp, ArrowDown, MapPin, Beer } from "lucide-react";
import { toast } from "sonner";

export default function Crawl() {
  const [ids, setIds] = useState(getCrawl());
  const [pubs, setPubs] = useState([]);

  useEffect(() => {
    Promise.all(ids.map((id) => fetchPub(id).catch(() => null))).then((list) =>
      setPubs(list.filter(Boolean))
    );
  }, [ids]);

  const move = (idx, dir) => {
    const next = [...ids];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    reorderCrawl(next);
    setIds(next);
  };

  const remove = (id) => {
    const next = removeFromCrawl(id);
    setIds(next);
    toast.success("Odebráno z tahu");
  };

  const clear = () => {
    clearCrawl();
    setIds([]);
    toast.success("Tah vyčištěn");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Plánovač</div>
        <h1 className="font-serif text-5xl text-stone-900 mt-2">Hospodský tah</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Seřaď si pořadí podniků. Aplikace si výběr pamatuje v prohlížeči — můžeš sdílet odkaz na konkrétní podnik s partou.
        </p>
      </div>

      {pubs.length === 0 ? (
        <div className="border-2 border-dashed border-stone-300 p-16 text-center">
          <Beer className="w-10 h-10 text-amber-700 mx-auto mb-4" />
          <p className="font-serif text-2xl text-stone-900">Tvůj tah je prázdný.</p>
          <p className="text-stone-600 mt-2">
            Přidej hospody tlačítkem <em>„Do tahu“</em> v adresáři.
          </p>
          <Link
            to="/hospody"
            data-testid="crawl-empty-browse"
            className="mt-6 inline-block bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 border border-amber-900 transition-colors"
          >
            Procházet hospody
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-stone-600" data-testid="crawl-count">
              {pubs.length} {pubs.length === 1 ? "zastávka" : pubs.length < 5 ? "zastávky" : "zastávek"} v plánu
            </div>
            <button
              onClick={clear}
              data-testid="clear-crawl-btn"
              className="text-xs text-stone-600 hover:text-red-700 transition-colors uppercase tracking-wider"
            >
              Vyčistit celý tah
            </button>
          </div>

          <ol className="space-y-4" data-testid="crawl-list">
            {pubs.map((p, idx) => (
              <li
                key={p.id}
                className="flex items-stretch border border-stone-200 bg-[#F3F0EA] hover:shadow-md transition-shadow"
              >
                <div className="bg-stone-900 text-amber-400 w-16 flex items-center justify-center font-serif text-3xl">
                  {idx + 1}
                </div>
                <div className="flex-1 p-5">
                  <div className="uppercase text-[10px] tracking-[0.2em] text-amber-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.ctvrt}
                  </div>
                  <Link
                    to={`/hospody/${p.id}`}
                    data-testid={`crawl-pub-link-${p.id}`}
                    className="font-serif text-2xl text-stone-900 hover:text-amber-800 transition-colors block"
                  >
                    {p.nazev}
                  </Link>
                  <p className="text-sm text-stone-700 mt-1 line-clamp-1">{p.pivo}</p>
                </div>
                <div className="flex flex-col border-l border-stone-200">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    data-testid={`crawl-up-${p.id}`}
                    className="flex-1 px-4 hover:bg-amber-50 disabled:opacity-30 transition-colors"
                    aria-label="Posunout nahoru"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === pubs.length - 1}
                    data-testid={`crawl-down-${p.id}`}
                    className="flex-1 px-4 border-t border-stone-200 hover:bg-amber-50 disabled:opacity-30 transition-colors"
                    aria-label="Posunout dolů"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    data-testid={`crawl-remove-${p.id}`}
                    className="flex-1 px-4 border-t border-stone-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                    aria-label="Odebrat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
