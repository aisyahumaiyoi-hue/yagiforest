import { Sun, Sparkles, MessageCircle } from "lucide-react";
import { useYagi } from "@/store/YagiContext";

export const InsightCards = ({ onConsult }) => {
    const { wellness, products } = useYagi();
    const completed = wellness?.routine_completed_today ?? 0;
    const total = wellness?.routine_total_today ?? 0;
    const routineMeta = total ? `${completed} of ${total} steps` : "No steps yet";
    const recommendedThumb = products[0]?.images?.[0];

    const INSIGHTS = [
        {
            key: "routine",
            title: "Today\u2019s routine",
            meta: routineMeta,
            desc: "Keep your barrier strong & calm",
            Icon: Sun,
        },
        {
            key: "recommended",
            title: "Recommended",
            meta: "For you",
            desc: "Curated picks for your skin",
            thumb: recommendedThumb,
            Icon: Sparkles,
        },
        {
            key: "consult",
            title: "Consult expert",
            meta: "Online",
            online: true,
            desc: "Get personalized advice",
            Icon: MessageCircle,
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-2.5">
            {INSIGHTS.map(({ key, title, meta, desc, Icon, thumb, online }) => (
                <button
                    key={key}
                    onClick={() => onConsult?.(key)}
                    className="glass-shell focus-ring rounded-[22px] text-left transition-transform active:scale-[0.97]"
                >
                    <div className="inner-card flex h-[118px] flex-col rounded-[18px] p-2.5">
                        {thumb ? (
                            <span className="h-9 w-9 overflow-hidden rounded-[11px] border border-[hsl(140_24%_52%/0.22)]">
                                <img src={thumb} alt="" className="h-full w-full object-cover" />
                            </span>
                        ) : (
                            <span className="grid h-9 w-9 place-items-center rounded-[11px] border border-[hsl(140_24%_52%/0.22)] bg-pale/70">
                                <Icon className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                            </span>
                        )}

                        <div className="mt-auto">
                            <div className="flex items-center gap-1">
                                <p className="text-[12.5px] font-semibold leading-tight text-foreground">
                                    {title}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {online && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(112_50%_46%)]" />
                                )}
                                <span className="text-[10.5px] font-medium text-secondary">
                                    {meta}
                                </span>
                            </div>
                            <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                                {desc}
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};
