import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFeatured, fetchDistricts, fetchRandom } from "../lib/api";
import PubCard from "../components/PubCard";
import { Beer, Shuffle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PUB_NAMES_FOR_SLOT = [
  "U Zlatého tygra", "U Fleků", "U Medvídků", "U Pinkasů", "Zlý časy",
  "Lokál Dlouhááá", "Vinohradský pivovar", "Dva kohouti", "Kulaťák",
  "Pivnice Trilobit", "Břevnovský klášterní pivovar",
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [slotName, setSlotName] = useState("Kam dnes na pivo?");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatured(6).then(setFeatured).catch(() => {});
    fetchDistricts().then(setDistricts).catch(() => {});
  }, []);

  const handleRandom = async () => {
    if (spinning) return;
    setSpinning(true);
    let i = 0;
    const interval = setInterval(() => {
      setSlotName(PUB_NAMES_FOR_SLOT[i % PUB_NAMES_FOR_SLOT.length]);
      i++;
    }, 90);
    try {
      const pub = await fetchRandom();
      setTimeout(() => {
        clearInterval(interval);
        setSlotName(pub.nazev);
        setSpinning(false);
        toast.success("Hospoda vylosována!");
        setTimeout(() => navigate(`/hospody/${pub.id}`), 600);
      }, 1300);
    } catch {
      clearInterval(interval);
      setSpinning(false);
      toast.error("Něco se nepovedlo");
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-stone-200">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1609315775378-fc9679b1786a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxob3AlMjBsZWF2ZXN8ZW58MHx8fHwxNzgwODI2MzY4fDA&ixlib=rb-4.1.0&q=85)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/50 via-[#FAF9F6]/85 to-[#FAF9F6]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="uppercase text-xs tracking-[0.3em] text-amber-700 mb-6" data-testid="hero-overline">
              Editoriální průvodce · 143 hospod · 14 čtvrtí
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-stone-900 leading-[1.05] tracking-tighter">
              Najdi pivo,<br />
              <span className="italic text-amber-800">které dnes piješ.</span>
            </h1>
            <p className="mt-6 text-lg text-stone-700 leading-relaxed max-w-xl font-sans">
              Filtruj podle pivovaru, čtvrti nebo polohy. Nech si poradit, kam zajít, nebo si naplánuj celý hospodský tah Prahou.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/hospody"
                data-testid="hero-browse-btn"
                className="bg-amber-700 hover:bg-amber-800 text-white font-sans px-7 py-3.5 border border-amber-900 transition-colors inline-flex items-center gap-2"
              >
                <Beer className="w-4 h-4" /> Procházet hospody
              </Link>
              <button
                type="button"
                onClick={handleRandom}
                data-testid="hero-random-btn"
                disabled={spinning}
                className="bg-transparent border border-stone-400 hover:border-amber-700 text-stone-900 hover:text-amber-800 px-7 py-3.5 transition-colors inline-flex items-center gap-2 font-sans disabled:opacity-60"
              >
                <Shuffle className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
                {spinning ? "Losuji…" : "Kam dnes na pivo?"}
              </button>
            </div>

            <div className="mt-12 max-w-xl border-l-2 border-amber-700 pl-6">
              <div className="uppercase text-[10px] tracking-[0.3em] text-amber-700">Náhodný výběr</div>
              <div className={`font-serif text-3xl text-stone-900 mt-2 ${spinning ? "slot-spin" : ""}`}>
                {slotName}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE Districts */}
      <section className="border-b border-stone-200 bg-stone-900 text-stone-100 overflow-hidden py-6">
        <div className="marquee-track">
          {[...districts, ...districts].map((d, i) => (
            <div key={i} className="flex items-center gap-3 px-8 whitespace-nowrap">
              <span className="font-serif text-3xl italic">{d.name}</span>
              <span className="text-amber-400 text-xs uppercase tracking-[0.2em]">{d.count} hospod</span>
              <span className="text-stone-500">·</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Vybíráme z nejlepších</div>
            <h2 className="font-serif text-4xl text-stone-900 mt-2">Doporučené hospody</h2>
          </div>
          <Link
            to="/hospody"
            data-testid="featured-all-link"
            className="text-amber-800 hover:text-amber-900 text-sm uppercase tracking-wider flex items-center gap-1"
          >
            Všechny hospody <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="featured-grid">
          {featured.map((p, i) => (
            <PubCard key={p.id} pub={p} index={i} featured={p.review_count > 0} />
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-stone-900 text-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="uppercase text-xs tracking-[0.3em] text-amber-400 mb-4">Pro pivní cestovatele</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-white leading-tight">
              Naplánuj si hospodský tah Prahou.
            </h2>
            <p className="mt-4 text-stone-300 max-w-md">
              Vyber si oblíbené podniky, seřaď si trasu a vyraz. Aplikace si pamatuje tvůj výběr.
            </p>
            <Link
              to="/tah"
              data-testid="cta-crawl-link"
              className="mt-8 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-900 px-7 py-3.5 font-semibold transition-colors"
            >
              Otevřít plánovač <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div
            className="hidden md:block h-72 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.pexels.com/photos/32606571/pexels-photo-32606571.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
            }}
          />
        </div>
      </section>
    </div>
  );
}
