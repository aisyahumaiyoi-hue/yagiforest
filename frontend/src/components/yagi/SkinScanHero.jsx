import { Sparkles, ArrowRight } from "lucide-react";
import { SCAN_HERO_IMAGE } from "./data";

export const SkinScanHero = ({ onScan }) => {
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
                                AI skin scan
                            </span>
                        </div>

                        <h2 className="font-serif-display mt-3 text-[30px] leading-[1.08] text-primary text-balance">
                            Understand your skin better
                        </h2>

                        <p className="mt-2.5 text-[12px] leading-snug text-muted-foreground">
                            Personalized insights for eczema-prone, sensitive skin
                        </p>

                        <div className="mt-auto pt-4">
                            <button
                                onClick={onScan}
                                className="btn-green focus-ring flex h-[50px] w-full items-center justify-between rounded-[17px] pl-4 pr-2"
                            >
                                <span className="text-[14px] font-semibold">Start scan</span>
                                <span className="btn-bubble grid h-9 w-9 place-items-center rounded-full">
                                    <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
                                </span>
                            </button>
                            <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
                                Takes less than 2 minutes
                            </p>
                        </div>
                    </div>

                    {/* Right image with analysis overlay */}
                    <div className="relative w-[46%] overflow-hidden">
                        <img
                            src={SCAN_HERO_IMAGE}
                            alt="Close-up of calm, healthy skin with AI dermatology analysis overlay"
                            className="absolute inset-0 h-full w-full origin-center animate-herozoom object-cover"
                        />
                        {/* left fade to blend into card */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent" />
                        {/* scan overlay marks */}
                        <svg
                            className="absolute inset-0 h-full w-full text-white/70"
                            viewBox="0 0 100 200"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <g stroke="hsl(112 60% 78%)" strokeWidth="0.4" fill="none" opacity="0.55">
                                <path d="M40 70 Q60 60 78 74" />
                                <path d="M42 100 Q62 96 80 108" />
                                <path d="M44 130 Q62 132 78 140" />
                                <path d="M62 60 L62 150" opacity="0.4" />
                            </g>
                            <g fill="hsl(112 65% 72%)">
                                <circle cx="58" cy="84" r="1.1" />
                                <circle cx="70" cy="104" r="1.1" />
                                <circle cx="54" cy="120" r="1.1" />
                                <circle cx="74" cy="132" r="1.1" />
                            </g>
                        </svg>
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/75 px-2 py-[3px] backdrop-blur-md">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(112_50%_46%)]" />
                            <span className="text-[9px] font-medium text-secondary">Analyzing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
