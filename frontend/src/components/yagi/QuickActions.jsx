import { ScanFace, Droplets, ShoppingBag } from "lucide-react";

const ACTIONS = [
    { key: "scan", label: "Scan", sub: "AI skin scan", Icon: ScanFace },
    { key: "routine", label: "Routine", sub: "My routine", Icon: Droplets },
    { key: "shop", label: "Shop", sub: "YAGI store", Icon: ShoppingBag },
];

export const QuickActions = ({ onAction }) => {
    return (
        <div className="grid grid-cols-3 gap-2.5">
            {ACTIONS.map(({ key, label, sub, Icon }) => (
                <button
                    key={key}
                    onClick={() => onAction?.(key)}
                    className="glass-shell focus-ring rounded-[22px] text-left transition-transform active:scale-[0.97]"
                >
                    <div className="inner-card flex h-[90px] flex-col justify-between rounded-[18px] p-3">
                        <span className="grid h-9 w-9 place-items-center rounded-[12px] border border-[hsl(140_24%_52%/0.24)] bg-pale/70">
                            <Icon className="h-[19px] w-[19px] text-secondary" strokeWidth={1.9} />
                        </span>
                        <div>
                            <p className="text-[13.5px] font-semibold text-foreground leading-tight">
                                {label}
                            </p>
                            <p className="text-[10.5px] text-muted-foreground leading-tight">
                                {sub}
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};
