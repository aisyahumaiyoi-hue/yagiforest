import { Leaf, Users, MapPin, Award, ChevronRight } from "lucide-react";
import { IMPACT_BG } from "@/data/products";

const METRICS = [
    { Icon: Leaf, title: "Planet", lines: ["Less plastic", "Refill contribution"] },
    { Icon: Users, title: "People", lines: ["Local producers", "Responsible sourcing"] },
    { Icon: MapPin, title: "Origin", lines: ["Made in Indonesia", "Aceh-origin ingredients"] },
];

export const ImpactCard = ({ onMethodology, product }) => {
    return (
        <div className="glass-shell rounded-[26px]">
            <div className="impact-glass rounded-[22px] p-4">
                <img
                    src={IMPACT_BG}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 object-cover opacity-40"
                />
                <div className="relative">
                    <p className="text-[11px] font-medium tracking-wide text-secondary">
                        Beauty with measurable impact
                    </p>
                    <h3 className="font-serif-display mt-1 text-[19px] leading-snug text-foreground">
                        {product ? "Impact behind this product" : "Your care can leave a lighter footprint."}
                    </h3>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                        See what your purchase supports beyond your skin.
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {METRICS.map(({ Icon, title, lines }) => (
                            <div key={title} className="inner-card rounded-[14px] p-2.5">
                                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-pale/80">
                                    <Icon className="h-[17px] w-[17px] text-secondary" strokeWidth={1.9} />
                                </span>
                                <p className="mt-1.5 text-[11.5px] font-semibold text-foreground">{title}</p>
                                {lines.map((l) => (
                                    <p key={l} className="text-[10px] leading-tight text-muted-foreground">
                                        {l}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onMethodology}
                        className="focus-ring mt-3 inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-secondary"
                    >
                        {product ? "How we calculate this" : "See how impact works"}
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AwardProof = ({ onLearn }) => (
    <div className="glass-shell rounded-[22px]">
        <div className="inner-card flex items-center gap-3 rounded-[18px] p-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[hsl(48_60%_92%)] to-[hsl(110_36%_86%)]">
                <Award className="h-[22px] w-[22px] text-[hsl(150_35%_30%)]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-medium tracking-wide text-secondary">Recognized for impact</p>
                <p className="text-[13px] font-semibold text-foreground">1st place · ASEAN SEDP 2025</p>
                <p className="line-clamp-1 text-[10.5px] text-muted-foreground">
                    Recognized through ASEAN’s social enterprise ecosystem.
                </p>
            </div>
            <button
                onClick={onLearn}
                className="focus-ring shrink-0 rounded-md text-[11.5px] font-medium text-secondary"
            >
                Learn why
            </button>
        </div>
    </div>
);
