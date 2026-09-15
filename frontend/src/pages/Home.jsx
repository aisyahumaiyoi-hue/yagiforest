import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MobileShell } from "@/components/yagi/MobileShell";
import { AppHeader } from "@/components/yagi/AppHeader";
import { SkinWellnessCard } from "@/components/yagi/SkinWellnessCard";
import { QuickActions } from "@/components/yagi/QuickActions";
import { CareAssistantHero } from "@/components/yagi/SkinScanHero";
import { InsightCards } from "@/components/yagi/InsightCards";
import { ProductGrid } from "@/components/yagi/ProductGrid";
import { useYagi } from "@/store/YagiContext";
import { CareHistory } from "@/components/yagi/CareHistory";

const fadeUp = {
    hidden: { opacity: 0, y: 6 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.04 * i, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    }),
};

export default function Home() {
    const navigate = useNavigate();
    const { isEnabled, careProfile, recommendations, routine, careCheckins } = useYagi();

    const askEnabled = isEnabled("skin_agent_enabled");

    const openAsk = () => navigate("/ask-yagi");
    const askUnavailable = () =>
        toast("Ask YAGI is unavailable right now", {
            description: "The care assistant is turned off temporarily. Please try again later.",
        });

    const handleAction = (key) => {
        if (key === "routine") return navigate("/routine");
        if (key === "shop") return navigate("/shop");
        if (key === "ask") return askEnabled ? openAsk() : askUnavailable();
    };

    const sections = [
        <SkinWellnessCard key="wellness" />,
        <QuickActions key="quick" onAction={handleAction} askEnabled={askEnabled} />,
        routine.length > 0 && <div key="today" className="glass-shell rounded-[22px]"><div className="inner-card rounded-[18px] p-4"><div className="flex items-center justify-between"><div><p className="text-[13.5px] font-semibold">Your care today</p><p className="mt-0.5 text-[11.5px] text-muted-foreground">{routine.filter((s) => s.completed).length} of {routine.length} steps complete</p></div><button onClick={() => navigate("/routine")} className="btn-green rounded-[11px] px-3 py-2 text-[11px] font-semibold">Continue routine</button></div>{careCheckins.eligibility?.eligible && <button onClick={() => navigate("/care-checkin")} className="mt-3 w-full rounded-[12px] bg-pale/70 px-3 py-2.5 text-left text-[12px] font-medium text-secondary">How is care feeling? <span className="float-right">Check in</span></button>}</div></div>,
        routine.length > 0 && <CareHistory key="history" />,
        <CareAssistantHero key="hero" onAsk={openAsk} available={askEnabled} onUnavailable={askUnavailable} />,
        <InsightCards key="insights" />,
        !careProfile && <div key="personalize" className="glass-shell rounded-[22px]"><div className="inner-card rounded-[18px] p-4"><p className="font-serif-display text-[20px]">Make YAGI more personal</p><p className="mt-1 text-[12px] text-muted-foreground">Tell us what your skin needs and we’ll tailor products and routines around you.</p><button onClick={() => navigate("/onboarding")} className="btn-green mt-3 rounded-[13px] px-4 py-2.5 text-[12px] font-semibold">Personalize my care</button><button onClick={() => { try { localStorage.setItem("yagi_onboarding_dismissed", "1"); } catch {} }} className="ml-3 text-[12px] font-medium text-secondary">Maybe later</button></div></div>,
        careProfile && <div key="context" className="rounded-[14px] bg-pale/60 px-3 py-2 text-[12px] font-medium text-secondary">For your {careProfile.concerns?.slice(0, 2).join(" and ").toLowerCase()} routine</div>,
        <ProductGrid key="products" products={recommendations.length ? recommendations.slice(0, 3) : undefined} />,
    ];

    return (
        <MobileShell>
            <div
                className="flex flex-col gap-3 px-4"
                style={{
                    paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
                }}
            >
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="pb-1">
                    <AppHeader />
                </motion.div>

                {sections.filter(Boolean).map((node, i) => (
                    <motion.div key={node.key} custom={i + 1} variants={fadeUp} initial="hidden" animate="show">
                        {node}
                    </motion.div>
                ))}
            </div>
        </MobileShell>
    );
}
