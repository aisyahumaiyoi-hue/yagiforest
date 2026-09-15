import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Sparkles, Droplets, User } from "lucide-react";
import { useYagi } from "@/store/YagiContext";

/**
 * Primary navigation: Home · Shop · Ask YAGI · Routine · Profile.
 *
 * The centre action is Ask YAGI because it is the strongest working
 * customer-care capability in the app. The previous centre item was "Scan",
 * which had no implementation behind it - a decorative CTA must never sit in
 * the primary navigation. The centre slot is only rendered when the server-side
 * feature flag says Ask YAGI is actually available.
 *
 * Styling is unchanged from the approved light-glass YAGI navigation.
 */
const buildItems = (askEnabled) => [
    { key: "home", label: "Home", Icon: Home, path: "/" },
    { key: "shop", label: "Shop", Icon: ShoppingBag, path: "/shop" },
    askEnabled && { key: "ask", label: "Ask YAGI", Icon: Sparkles, path: "/ask-yagi", center: true },
    { key: "routine", label: "Routine", Icon: Droplets, path: "/routine" },
    { key: "profile", label: "Profile", Icon: User, path: "/profile" },
].filter(Boolean);

export const BottomNavigation = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isEnabled } = useYagi();

    const askEnabled = isEnabled("skin_agent_enabled");
    const items = buildItems(askEnabled);

    const activeKey =
        pathname === "/" ? "home"
            : pathname.startsWith("/shop") || pathname.startsWith("/product") || pathname.startsWith("/cart") ? "shop"
            : pathname.startsWith("/ask-yagi") ? "ask"
            : pathname.startsWith("/routine") ? "routine"
            : pathname.startsWith("/profile") || pathname.startsWith("/rewards") || pathname.startsWith("/impact") ? "profile"
            : "";

    return (
        <nav
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
            aria-label="Primary"
        >
            <div className="bottom-glass pointer-events-auto mx-auto flex h-[74px] items-center justify-around rounded-[28px] px-2">
                {items.map(({ key, label, Icon, path, center }) => {
                    const isActive = activeKey === key;
                    if (center) {
                        return (
                            <button
                                key={key}
                                onClick={() => navigate(path)}
                                aria-label={label}
                                aria-current={isActive ? "page" : undefined}
                                className="focus-ring relative -mt-7 flex flex-col items-center"
                            >
                                <span className="absolute -top-1 h-[58px] w-[58px] rounded-full bg-[hsl(112_55%_60%/0.28)] blur-md" />
                                <span className="relative grid h-[58px] w-[58px] place-items-center rounded-[20px] border border-white/70 bg-gradient-to-br from-[hsl(96_58%_90%)] to-[hsl(116_44%_72%)] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.85),0_10px_22px_-8px_hsl(110_55%_42%/0.55)] transition-transform active:scale-95">
                                    <Icon className="h-7 w-7 text-primary" strokeWidth={1.9} />
                                </span>
                                <span className="mt-1 text-[11px] font-semibold text-secondary">{label}</span>
                            </button>
                        );
                    }
                    return (
                        <button
                            key={key}
                            onClick={() => navigate(path)}
                            aria-label={label}
                            aria-current={isActive ? "page" : undefined}
                            className="focus-ring flex w-[56px] flex-col items-center gap-1 rounded-xl py-1 transition-transform active:scale-95"
                        >
                            <Icon
                                className={`h-[22px] w-[22px] ${isActive ? "text-secondary" : "text-muted-foreground"}`}
                                strokeWidth={isActive ? 2.2 : 1.8}
                            />
                            <span
                                className={`text-[11px] ${
                                    isActive ? "font-semibold text-secondary" : "font-medium text-muted-foreground"
                                }`}
                            >
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
