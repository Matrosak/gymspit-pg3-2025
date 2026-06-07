import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPub, fetchReviews, postReview } from "../lib/api";
import { isFavorite, toggleFavorite, addToCrawl } from "../lib/storage";
import RatingStars from "../components/RatingStars";
import { Heart, MapPin, Plus, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

export default function PubDetail() {
  const { id } = useParams();
  const [pub, setPub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [fav, setFav] = useState(false);
  const [form, setForm] = useState({ nickname: "", score: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetchPub(id).then((p) => {
      setPub(p);
      setFav(isFavorite(p.id));
    });
    fetchReviews(id).then(setReviews);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleFav = () => {
    const list = toggleFavorite(pub.id);
    const isNow = list.includes(pub.id);
    setFav(isNow);
    toast.success(isNow ? "Přidáno do oblíbených" : "Odebráno z oblíbených");
  };

  const handleCrawl = () => {
    addToCrawl(pub.id);
    toast.success(`„${pub.nazev}“ přidáno do hospodského tahu`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.nickname.trim() || form.score < 1) {
      toast.error("Zadej přezdívku a hvězdičky.");
      return;
    }
    setSubmitting(true);
    try {
      await postReview({
        pub_id: Number(id),
        nickname: form.nickname.trim(),
        score: form.score,
        comment: form.comment.trim(),
      });
      toast.success("Děkujeme za hodnocení!");
      setForm({ nickname: "", score: 0, comment: "" });
      load();
    } catch (err) {
      toast.error("Hodnocení se nepodařilo odeslat.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!pub) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-stone-500 italic font-serif text-2xl">
        Načítám hospodu…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/hospody"
        data-testid="back-to-directory"
        className="text-sm text-stone-600 hover:text-amber-800 inline-flex items-center gap-1 mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět do adresáře
      </Link>

      <header className="border-b border-stone-200 pb-10">
        <div className="uppercase text-xs tracking-[0.3em] text-amber-700 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {pub.ctvrt}
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl text-stone-900 mt-3 leading-tight tracking-tighter">
          {pub.nazev}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2" data-testid="pub-rating">
            <RatingStars value={Math.round(pub.avg_rating)} readOnly testIdPrefix="display-star" />
            <span className="font-semibold text-stone-900">
              {pub.review_count > 0 ? pub.avg_rating.toFixed(1) : "—"}
            </span>
            <span className="text-stone-500 text-sm">
              ({pub.review_count} {pub.review_count === 1 ? "hodnocení" : "hodnocení"})
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFav}
              data-testid="detail-favorite-btn"
              className={`px-4 py-2 border text-sm flex items-center gap-2 transition-colors ${
                fav
                  ? "bg-amber-700 text-white border-amber-800"
                  : "border-stone-300 text-stone-800 hover:border-amber-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? "fill-white" : ""}`} />
              {fav ? "Oblíbené" : "Do oblíbených"}
            </button>
            <button
              type="button"
              onClick={handleCrawl}
              data-testid="detail-add-crawl-btn"
              className="px-4 py-2 border border-stone-300 text-sm flex items-center gap-2 hover:border-amber-700 hover:text-amber-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Přidat do tahu
            </button>
          </div>
        </div>

        <div className="mt-8 max-w-2xl border-l-2 border-amber-700 pl-6">
          <div className="uppercase text-[10px] tracking-[0.3em] text-amber-700">Co tady čepují</div>
          <p className="font-serif text-2xl text-stone-900 italic mt-2 leading-relaxed">
            {pub.pivo}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {pub.beer_tags.map((t) => (
            <Link
              key={t}
              to={`/hospody?beer=${encodeURIComponent(t)}`}
              data-testid={`tag-${t}`}
              className="bg-amber-100/60 text-amber-900 text-xs px-3 py-1 uppercase tracking-wider font-semibold border border-amber-200/60 hover:bg-amber-200 transition-colors"
            >
              {t}
            </Link>
          ))}
        </div>
      </header>

      {/* Review form */}
      <section className="py-12 border-b border-stone-200">
        <h2 className="font-serif text-3xl text-stone-900 mb-2">Ohodnoť tuto hospodu</h2>
        <p className="text-stone-600 mb-8 text-sm">
          Bez registrace, jen s přezdívkou. Tvoje hodnocení pomáhá ostatním pivařům.
        </p>
        <form onSubmit={submitReview} className="space-y-6 max-w-xl">
          <div>
            <label className="uppercase text-xs tracking-[0.2em] text-amber-700 block mb-2">Přezdívka</label>
            <input
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              data-testid="review-nickname-input"
              maxLength={40}
              required
              className="w-full bg-transparent border-b-2 border-stone-300 focus:border-amber-700 outline-none py-2 text-stone-900 font-sans"
              placeholder="Pivař Franta"
            />
          </div>
          <div>
            <label className="uppercase text-xs tracking-[0.2em] text-amber-700 block mb-2">Hvězdičky</label>
            <RatingStars
              value={form.score}
              onChange={(v) => setForm({ ...form, score: v })}
              testIdPrefix="review-star"
            />
          </div>
          <div>
            <label className="uppercase text-xs tracking-[0.2em] text-amber-700 block mb-2">Komentář</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              data-testid="review-comment-input"
              maxLength={500}
              rows={4}
              className="w-full bg-transparent border border-stone-300 focus:border-amber-700 outline-none p-3 text-stone-900 font-sans resize-none"
              placeholder="Pěkná pěna, dobrá obsluha…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            data-testid="submit-review-btn"
            className="bg-amber-700 hover:bg-amber-800 text-white px-7 py-3 border border-amber-900 transition-colors disabled:opacity-50"
          >
            {submitting ? "Odesílám…" : "Odeslat hodnocení"}
          </button>
        </form>
      </section>

      {/* Reviews list */}
      <section className="py-12">
        <h2 className="font-serif text-3xl text-stone-900 mb-8">Co říkají pivaři</h2>
        {reviews.length === 0 ? (
          <p className="italic text-stone-500 font-serif text-xl">
            Zatím žádné hodnocení. Buď první, kdo ohodnotí.
          </p>
        ) : (
          <div className="space-y-6" data-testid="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="border-l-2 border-stone-200 pl-5 py-1 hover:border-amber-700 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-stone-900">{r.nickname}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < r.score ? "fill-amber-500 text-amber-500" : "text-stone-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <time className="text-xs text-stone-500">
                    {new Date(r.created_at).toLocaleDateString("cs-CZ")}
                  </time>
                </div>
                {r.comment && <p className="mt-2 text-stone-700 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
