import { useEffect, useState } from "react";
import { fetchNearest, fetchDistricts, fetchPubs } from "../lib/api";
import PubCard from "../components/PubCard";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Nearest() {
  const [districts, setDistricts] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(""); // 'gps' | 'district'
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDistricts().then(setDistricts);
  }, []);

  const handleGps = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Tvůj prohlížeč nepodporuje geolokaci.");
      return;
    }
    setLoading(true);
    setMode("gps");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchNearest(pos.coords.latitude, pos.coords.longitude, 12);
          setPubs(data);
          toast.success("Nejbližší hospody nalezeny");
        } catch {
          setError("Nepodařilo se načíst hospody.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Nedovolil jsi přístup k poloze.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleDistrictSelect = async (name) => {
    setError("");
    setSelectedDistrict(name);
    setMode("district");
    setLoading(true);
    try {
      const data = await fetchPubs({ district: name });
      setPubs(data);
    } catch {
      setError("Nepodařilo se načíst hospody.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Najdi nejbližší pivo</div>
        <h1 className="font-serif text-5xl text-stone-900 mt-2">Kde teď čepují?</h1>
        <p className="text-stone-600 mt-3 max-w-2xl">
          Použij polohu prohlížeče, nebo vyber svou čtvrť. Najdeme ti hospody přímo po ruce.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <button
          type="button"
          onClick={handleGps}
          data-testid="gps-btn"
          disabled={loading}
          className="p-8 border-2 border-stone-300 hover:border-amber-700 hover:bg-amber-50/50 transition-colors text-left disabled:opacity-50"
        >
          <MapPin className="w-8 h-8 text-amber-700" />
          <div className="font-serif text-3xl text-stone-900 mt-4">Použít moji polohu</div>
          <div className="text-stone-600 mt-2 text-sm">GPS prohlížeče — prohlížeč se zeptá na povolení.</div>
        </button>

        <div className="p-8 border-2 border-stone-200">
          <div className="uppercase text-xs tracking-[0.2em] text-amber-700">Nebo vyber čtvrť</div>
          <div className="font-serif text-3xl text-stone-900 mt-2 mb-6">Procházet podle čtvrti</div>
          <div className="flex flex-wrap gap-2">
            {districts.map((d) => (
              <button
                key={d.name}
                onClick={() => handleDistrictSelect(d.name)}
                data-testid={`nearest-district-${d.name}`}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  selectedDistrict === d.name && mode === "district"
                    ? "bg-amber-700 text-white border-amber-800"
                    : "border-stone-300 text-stone-700 hover:border-amber-700"
                }`}
              >
                {d.name} <span className="opacity-60">({d.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 border border-red-300 bg-red-50 text-red-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-stone-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Hledám hospody…
        </div>
      )}

      {pubs.length > 0 && (
        <section>
          <h2 className="font-serif text-3xl text-stone-900 mb-6">
            {mode === "gps" ? "Hospody blízko tebe" : `Hospody ve čtvrti ${selectedDistrict}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="nearest-results">
            {pubs.map((p, i) => (
              <PubCard key={p.id} pub={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
