import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Gift, Leaf } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";

export default function Rewards() {
    const navigate = useNavigate();
    const { isCustomer, user } = useYagi();
    const [data, setData] = useState(null);
    const [tiers, setTiers] = useState([]);

    useEffect(() => {
        if (isCustomer) {
            api.loyalty().then(setData).catch(() => {});
            api.config().then((c) => setTiers(c.tiers || [])).catch(() => {});
        }
    }, [isCustomer]);

    if (!isCustomer) {
        return (
            <MobileShell nav={false}>
                <TopBar title="Rewards" />
                <div className="flex flex-col items-center px-6 pt-24 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-pale"><Gift className="h-8 w-8 text-secondary" strokeWidth={1.6} /></span>
                    <h2 className="font-serif-display mt-5 text-[22px] text-foreground">Your care, rewarded.</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Sign in to earn points through YAGI purchases and meaningful care actions.</p>
                    <button onClick={() => navigate("/auth")} className="btn-green focus-ring mt-5 rounded-[15px] px-6 py-3 text-[14px] font-semibold">Sign in</button>
                </div>
            </MobileShell>
        );
    }

    const lifetime = data?.lifetime ?? 0;
    const nextThreshold = tiers.find((t) => t.threshold > lifetime)?.threshold;
    const prevThreshold = [...tiers].reverse().find((t) => t.threshold <= lifetime)?.threshold ?? 0;
    const pct = nextThreshold ? Math.min(100, Math.round(((lifetime - prevThreshold) / (nextThreshold - prevThreshold)) * 100)) : 100;

    return (
        <MobileShell nav={false}>
            <TopBar title="Rewards" />
            <div className="flex flex-col gap-3.5 px-4 pt-1 pb-24">
                <div className="pt-1">
                    <h1 className="font-serif-display text-[24px] leading-tight text-foreground">Your care, rewarded.</h1>
                    <p className="mt-1 text-[13px] text-muted-foreground">Earn points through YAGI purchases and meaningful care actions.</p>
                </div>

                {/* Member card */}
                <div className="glass-shell rounded-[26px]">
                    <div className="impact-glass rounded-[22px] p-5">
                        <div className="flex items-center justify-between">
                            <span className="font-serif-display text-[18px] text-primary">YAGI</span>
                            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10.5px] font-semibold text-secondary">{data?.tier} tier</span>
                        </div>
                        <p className="mt-4 text-[11px] text-muted-foreground">Available points</p>
                        <p className="font-serif-display text-[40px] leading-none text-primary">{data?.available ?? 0}</p>
                        {data?.pending > 0 && <p className="mt-1 text-[11.5px] text-secondary">+{data.pending} pending from recent orders</p>}
                        <div className="mt-4">
                            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                                <span>{data?.next_tier ? `${data.points_to_next} points to ${data.next_tier}` : "Highest tier reached"}</span>
                                <span>{pct}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/60">
                                <div className="h-full rounded-full bg-gradient-to-r from-[hsl(96_55%_66%)] to-[hsl(120_45%_50%)]" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                        <p className="mt-4 text-[10.5px] text-muted-foreground">Member {user?.member_code}</p>
                    </div>
                </div>

                {/* Earn / Grow / Redeem */}
                <div className="grid grid-cols-3 gap-2.5">
                    {[{ Icon: Sparkles, t: "Earn", d: "Through care actions" }, { Icon: TrendingUp, t: "Grow", d: "Your tier over time" }, { Icon: Gift, t: "Redeem", d: "Available rewards" }].map(({ Icon, t, d }) => (
                        <div key={t} className="glass-shell rounded-[20px]">
                            <div className="inner-card flex h-full flex-col rounded-[16px] p-3">
                                <Icon className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                                <p className="mt-1.5 text-[12.5px] font-semibold text-foreground">{t}</p>
                                <p className="text-[10px] leading-tight text-muted-foreground">{d}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tiers */}
                <div>
                    <p className="mb-2 text-[13.5px] font-semibold text-foreground">Membership tiers</p>
                    <div className="flex flex-col gap-2">
                        {tiers.map((t) => {
                            const active = data?.tier === t.name;
                            return (
                                <div key={t.key} className="glass-shell rounded-[18px]">
                                    <div className={`inner-card flex items-center gap-3 rounded-[14px] p-3.5 ${active ? "ring-2 ring-[hsl(120_45%_58%)]" : ""}`}>
                                        <Leaf className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                                        <div className="flex-1">
                                            <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                                            <p className="text-[10.5px] text-muted-foreground">From {t.threshold} lifetime points</p>
                                        </div>
                                        {active && <span className="rounded-full bg-pale px-2 py-[2px] text-[9.5px] font-semibold text-secondary">Current</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Points history */}
                <div>
                    <p className="mb-2 text-[13.5px] font-semibold text-foreground">Points history</p>
                    <div className="glass-shell rounded-[18px]">
                        <div className="inner-card divide-y divide-border/60 rounded-[14px] px-4">
                            {(data?.ledger || []).length === 0 && (
                                <p className="py-4 text-center text-[12px] text-muted-foreground">No activity yet.</p>
                            )}
                            {(data?.ledger || []).map((l) => (
                                <div key={l.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-[12.5px] font-medium capitalize text-foreground">{l.event_type.replace("_", " ")}</p>
                                        <p className="text-[10.5px] capitalize text-muted-foreground">{l.status}{l.order_number ? ` · ${l.order_number}` : ""}</p>
                                    </div>
                                    <span className={`text-[13px] font-semibold ${l.points_delta >= 0 ? "text-secondary" : "text-[hsl(4_72%_50%)]"}`}>
                                        {l.points_delta >= 0 ? "+" : ""}{l.points_delta}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MobileShell>
    );
}
