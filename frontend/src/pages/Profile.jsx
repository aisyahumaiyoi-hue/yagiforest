import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    User, Package, Gift, Heart, Leaf, LayoutDashboard, ChevronRight, LogOut, Sparkles,
} from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { Wordmark } from "@/components/yagi/Wordmark";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";

/**
 * Profile sections. Only entries with a real destination are listed; the
 * previous version rendered "Addresses", "Help" and "Settings" rows that raised
 * a "Coming soon" toast, which is a dead end in a primary menu.
 */
const SECTIONS = [
    ["Orders", Package, "/profile/orders"],
    ["Rewards", Gift, "/rewards"],
    ["Saved products", Heart, "/shop"],
    ["My impact", Leaf, "/impact"],
];

export default function Profile() {
    const navigate = useNavigate();
    const { isCustomer, user, logout, ready, careProfile } = useYagi();
    const [loyalty, setLoyalty] = useState(null);

    useEffect(() => {
        if (isCustomer) api.loyalty().then(setLoyalty).catch(() => setLoyalty(null));
    }, [isCustomer]);

    const signOut = async () => {
        try {
            await logout();
            toast("Signed out");
        } catch (e) {
            toast("Couldn\u2019t sign out", { description: e.message });
        }
    };

    return (
        <MobileShell>
            <header className="sticky top-0 z-20 flex items-center px-4 pb-2.5" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}>
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(46_40%_98%/0.92)] to-transparent backdrop-blur-[6px]" />
                <Wordmark className="flex-1" />
            </header>

            <div className="flex flex-col gap-3.5 px-4 pt-1" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" }}>
                {ready && !isCustomer ? (
                    <>
                        <div className="pt-2 text-center">
                            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pale">
                                <User className="h-8 w-8 text-secondary" strokeWidth={1.6} />
                            </span>
                            <h1 className="font-serif-display mt-4 text-[24px] text-foreground">Make YAGI yours.</h1>
                            <p className="mt-1.5 text-[13px] text-muted-foreground">
                                Save your routine, points, orders and skin progress across devices.
                            </p>
                            <div className="mt-5 flex flex-col gap-2.5">
                                <button onClick={() => navigate("/auth")} className="btn-green focus-ring w-full rounded-[15px] py-3.5 text-[14px] font-semibold">Sign in</button>
                                <button onClick={() => navigate("/auth")} className="glass-control focus-ring w-full rounded-[15px] py-3.5 text-[14px] font-medium text-secondary">Create account</button>
                            </div>
                        </div>
                        <div className="glass-shell rounded-[20px]">
                            <div className="inner-card flex flex-col items-center rounded-[16px] px-4 py-5 text-center">
                                <p className="text-[12.5px] text-muted-foreground">
                                    Help, privacy and terms pages are not published in the app yet.
                                </p>
                                <button
                                    onClick={() => navigate("/impact")}
                                    className="focus-ring mt-2 text-[12.5px] font-medium text-secondary underline underline-offset-2"
                                >
                                    How YAGI measures impact
                                </button>
                            </div>
                        </div>
                    </>
                ) : isCustomer ? (
                    <>
                        {/* Identity */}
                        <div className="glass-shell rounded-[24px]">
                            <div className="inner-card flex items-center gap-3 rounded-[20px] p-4">
                                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[hsl(96_58%_88%)] to-[hsl(116_44%_72%)] text-[20px] font-semibold text-primary">
                                    {(user?.display_name || user?.email || "Y")[0].toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[15px] font-semibold text-foreground">{user?.display_name}</p>
                                    <p className="truncate text-[11.5px] text-muted-foreground">{user?.email}</p>
                                    <p className="mt-0.5 text-[10.5px] text-secondary">
                                        {user?.member_code ? `Member ${user.member_code} · ` : ""}{user?.tier} tier
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Points module */}
                        <button onClick={() => navigate("/rewards")} className="glass-shell focus-ring rounded-[22px] text-left">
                            <div className="impact-glass flex items-center gap-3 rounded-[18px] p-4">
                                <Sparkles className="h-5 w-5 text-secondary" strokeWidth={1.9} />
                                <div className="flex-1">
                                    <p className="text-[13px] font-semibold text-foreground">YAGI Points · {loyalty?.available ?? 0}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {loyalty === null
                                            ? "Loading your balance…"
                                            : loyalty.points_to_next
                                            ? `${loyalty.points_to_next} until ${loyalty.next_tier}`
                                            : "Top tier reached"}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                            </div>
                        </button>

                        {/* Sections */}
                        <div className="glass-shell rounded-[20px]">
                            <div className="inner-card divide-y divide-border/60 rounded-[16px] px-4">
                                {SECTIONS.map(([label, Icon, path]) => (
                                    <button key={label} onClick={() => navigate(path)} className="flex w-full items-center gap-3 py-3 text-left">
                                        <Icon className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                                        <span className="flex-1 text-[13px] text-foreground">{label}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => navigate("/onboarding")} className="glass-shell focus-ring rounded-[22px] text-left">
                            <div className="inner-card flex items-center gap-3 rounded-[18px] p-3.5">
                                <Sparkles className="h-5 w-5 text-secondary" strokeWidth={1.9} />
                                <div className="min-w-0 flex-1"><p className="text-[13.5px] font-semibold text-foreground">Care profile</p><p className="text-[11.5px] text-muted-foreground">{careProfile ? "Update your self-reported care context" : "Personalize recommendations and routines"}</p></div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                            </div>
                        </button>

                        {user?.role === "superadmin" && (
                            <button
                                onClick={() => navigate("/superadmin")}
                                className="glass-shell focus-ring rounded-[22px] text-left"
                            >
                                <div className="inner-card flex items-center gap-3 rounded-[18px] p-3.5">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[hsl(48_60%_92%)] to-[hsl(110_36%_86%)]">
                                        <LayoutDashboard className="h-[22px] w-[22px] text-[hsl(150_35%_30%)]" strokeWidth={1.8} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13.5px] font-semibold text-foreground">Admin console</p>
                                        <p className="text-[11.5px] text-muted-foreground">Manage products, orders, users & impact</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                                </div>
                            </button>
                        )}

                        <button onClick={signOut} className="glass-control focus-ring inline-flex items-center justify-center gap-2 rounded-[15px] py-3.5 text-[13.5px] font-medium text-secondary">
                            <LogOut className="h-4 w-4" strokeWidth={2} /> Sign out
                        </button>
                    </>
                ) : null}
            </div>
        </MobileShell>
    );
}
