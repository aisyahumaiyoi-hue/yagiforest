import { Leaf, TrendingUp } from "lucide-react";
import { WellnessChart } from "./WellnessChart";

export const SkinWellnessCard = () => {
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
                                88
                            </span>
                            <span className="mb-1.5 text-sm text-secondary/80">/100</span>
                        </div>

                        <div className="mt-1">
                            <p className="text-[13px] font-medium text-secondary">Calmer today</p>
                            <p className="text-[11.5px] text-muted-foreground">Barrier improving</p>
                        </div>
                    </div>

                    {/* Right zone: chart */}
                    <div className="relative flex flex-1 flex-col justify-between pt-0.5">
                        <div className="flex justify-end">
                            <span className="heart-chip flex items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-semibold text-secondary">
                                <TrendingUp className="h-3 w-3" strokeWidth={2.4} />
                                12 pts
                            </span>
                        </div>
                        <WellnessChart />
                        <p className="text-right text-[10px] text-muted-foreground">7-day progress</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
