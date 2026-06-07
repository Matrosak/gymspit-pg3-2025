import { Star } from "lucide-react";

export default function RatingStars({ value = 0, onChange, size = 24, readOnly = false, testIdPrefix = "star" }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(i)}
            data-testid={`${testIdPrefix}-${i}`}
            className={`transition-transform ${readOnly ? "cursor-default" : "hover:scale-110 cursor-pointer"}`}
            aria-label={`${i} z 5`}
          >
            <Star
              style={{ width: size, height: size }}
              className={active ? "fill-amber-500 text-amber-500" : "text-stone-300"}
            />
          </button>
        );
      })}
    </div>
  );
}
