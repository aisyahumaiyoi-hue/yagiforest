import { Leaf, TrendingUp, TrendingDown } from "lucide-react";
import { WellnessChart } from "./WellnessChart";
import { useYagi } from "@/store/YagiContext";

export const SkinWellnessCard = () => {
    const { wellness } = useYagi();
    const score = wellness?.score ?? 0;
    const delta = wellness?.delta ?? 0;
    const status = wellness?.status ?? "Getting started";
    const note = wellness?.note ?? "Complete your routine to build a stronger barrier";
    const series = (wellness?.series || []).map((d) => d.routine);
    const TrendIcon = delta < 0 ? TrendingDown : TrendingUp;
    const trendLabel = `${delta > 0 ? "+" : ""}${delta} pts`;

    return (
        <div className="glass-shell rounded-[28px]">
            <div className="inner-card rounded-[24px] px-4 py-3.5">
                <div className="flex items-stretch gap-3">
                    {/* Left zone */}
                    <div className="flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="grid h-5 w-5 place-items-center rounded-md bg-pale">
                                <Leaf className="h-3 w-3 text-secondary" strokeWidth={2} />
                            </span>
                            <span className="text-[13px] font-medium text-foreground">
                                Skin wellness
                            </span>
                        </div>

                        <div className="mt-1 flex items-end gap-1">
                            <span className="font-serif-display text-[44px] leading-none text-primary">
                                {score}
                            </span>
                            <span className="mb-1.5 text-sm text-secondary/80">/100</span>
                        </div>

                        <div className="mt-1">
                            <p className="text-[13px] font-medium text-secondary">{status}</p>
                            <p className="text-[11.5px] text-muted-foreground">{note}</p>
                        </div>
                    </div>

                    {/* Right zone: chart */}
                    <div className="relative flex flex-1 flex-col justify-between pt-0.5">
                        <div className="flex justify-end">
                            <span className="heart-chip flex items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-semibold text-secondary">
                                <TrendIcon className="h-3 w-3" strokeWidth={2.4} />
                                {trendLabel}
                            </span>
                        </div>
                        <WellnessChart series={series} />
                        <p className="text-right text-[10px] text-muted-foreground">7-day progress</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
