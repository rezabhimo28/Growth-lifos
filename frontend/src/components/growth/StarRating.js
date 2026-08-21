import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const StarRating = ({ value = 0, max = 5, onChange, size = 18, readOnly = false, testId }) => {
  const [hover, setHover] = useState(0);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-0.5" data-testid={testId}>
      {stars.map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange && onChange(n)}
            className={cn("transition-transform", !readOnly && "hover:scale-110", readOnly && "cursor-default")}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
            />
          </button>
        );
      })}
    </div>
  );
};
