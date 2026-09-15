import { Star } from "lucide-react";

/**
 * RatingSummary — renders a product rating ONLY when it is derived from real
 * published reviews. When `stats` is null (no review records exist) it renders
 * an honest "New" state instead of an invented score.
 *
 * Do not reintroduce a fallback number here: fabricated social proof was
 * deliberately removed from YAGI.
 */
export const RatingSummary = ({ stats, size = 12, showCount = true, className = "" }) => {
    if (!stats) {
        return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground ${className}`}>
                New
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] text-muted-foreground ${className}`}>
            <Star
                className="text-[hsl(96_50%_46%)]"
                style={{ width: size, height: size }}
                strokeWidth={2}
                fill="hsl(96 50% 46%)"
            />
            <span className="font-medium text-foreground">{Number(stats.rating).toFixed(1)}</span>
            {showCount && <span>· {stats.count} review{stats.count === 1 ? "" : "s"}</span>}
        </span>
    );
};

/** A row of stars for an individual real review (always has a rating). */
export const Stars = ({ rating = 0, size = 12, className = "" }) => {
    const rounded = Math.round(Number(rating) || 0);
    return (
        <span className={`inline-flex items-center gap-[2px] ${className}`} aria-label={`${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={i <= rounded ? "text-[hsl(96_50%_46%)]" : "text-[hsl(140_12%_82%)]"}
                    style={{ width: size, height: size }}
                    strokeWidth={1.6}
                    fill={i <= rounded ? "hsl(96 50% 46%)" : "transparent"}
                />
            ))}
        </span>
    );
};
