import { Star } from "lucide-react";

export const Stars = ({ rating = 0, count, size = 12, className = "" }) => (
    <span className={`inline-flex items-center gap-1 text-[11px] text-muted-foreground ${className}`}>
        <Star
            className="text-[hsl(96_50%_46%)]"
            style={{ width: size, height: size }}
            strokeWidth={2}
            fill="hsl(96 50% 46%)"
        />
        <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
        {count != null && <span>· {count}</span>}
    </span>
);
