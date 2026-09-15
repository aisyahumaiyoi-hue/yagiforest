import { Sparkles, ArrowRight } from "lucide-react";
import { SCAN_HERO_IMAGE } from "./data";

/**
 * CareAssistantHero — the primary Home capability card.
 *
 * This replaces the previous "AI skin scan" hero, which presented a scanning
 * experience ("Analyzing" badge, scan overlay) for a pipeline that does not
 * exist. The card now promotes Ask YAGI, which is genuinely implemented and
 * grounded in YAGI product data and care education.
 *
 * Skin Analyzer is unfinished and is intentionally NOT promoted here. It is
 * surfaced only as an explicitly labelled "In development" note in the Routine
 * screen, behind the server-side `skin_analyzer_enabled` flag.
 */
export const CareAssistantHero = ({ onAsk, available = true, onUnavailable }) => {
    return (
        <div className="glass-shell rounded-[30px]">
            <div className="inner-card overflow-hidden rounded-[26px]">
                <div className="relative flex min-h-[300px]">
                    {/* Left content */}
                    <div className="relative z-10 flex w-[54%] flex-col p-5">
                        <div className="flex items-center gap-1.5">
                            <span className="grid h-6 w-6 place-items-center rounded-lg bg-pale">
                                <Sparkles className="h-3.5 w-3.5 text-secondary" strokeWidth={2} />
                            </span>
                            <span className="text-[11.5px] font-medium tracking-wide text-secondary">
                                Ask YAGI
                            </span>
                        </div>

                        <h2 className="font-serif-display mt-3 text-[30px] leading-[1.08] text-primary text-balance">
                            Ask about your skin
                        </h2>

                        <p className="mt-2.5 text-[12px] leading-snug text-muted-foreground">
                            Grounded answers on YAGI products, routines and sensitive-skin care.
                        </p>

                        <div className="mt-auto pt-4">
                            <button
                                onClick={available ? onAsk : onUnavailable}
                                className="btn-green focus-ring flex h-[50px] w-full items-center justify-between rounded-[17px] pl-4 pr-2"
                            >
                                <span className="text-[14px] font-semibold">
                                    {available ? "Ask YAGI" : "Temporarily unavailable"}
                                </span>
                                <span className="btn-bubble grid h-9 w-9 place-items-center rounded-full">
                                    <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
                                </span>
                            </button>
                            <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
                                General care information, not medical diagnosis
                            </p>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="relative w-[46%] overflow-hidden">
                        <img
                            src={SCAN_HERO_IMAGE}
                            alt="Close-up of calm, healthy skin"
                            className="absolute inset-0 h-full w-full origin-center animate-herozoom object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent" />
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/75 px-2 py-[3px] backdrop-blur-md">
                            <Sparkles className="h-2.5 w-2.5 text-secondary" strokeWidth={2.2} />
                            <span className="text-[9px] font-medium text-secondary">Grounded in YAGI data</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
