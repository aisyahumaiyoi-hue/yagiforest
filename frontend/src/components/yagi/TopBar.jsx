import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Wordmark } from "./Wordmark";

export const TopBar = ({ title, right, onBack, showWordmark = true, subtitle }) => {
    const navigate = useNavigate();
    return (
        <header
            className="sticky top-0 z-20 flex items-center gap-2 px-4"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: "10px" }}
        >
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(46_40%_98%/0.92)] to-[hsl(46_40%_98%/0)] backdrop-blur-[6px]" />
            <button
                aria-label="Go back"
                onClick={() => (onBack ? onBack() : navigate(-1))}
                className="glass-control focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-[14px]"
            >
                <ChevronLeft className="h-[20px] w-[20px] text-primary" strokeWidth={2} />
            </button>

            <div className="flex min-w-0 flex-1 flex-col items-center">
                {title ? (
                    <span className="truncate text-[15px] font-semibold text-foreground">{title}</span>
                ) : showWordmark ? (
                    <Wordmark className="text-[22px]" />
                ) : null}
                {subtitle && <span className="text-[11px] text-muted-foreground">{subtitle}</span>}
            </div>

            <div className="flex shrink-0 items-center gap-2">{right}</div>
        </header>
    );
};
