import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MobileShell } from "@/components/yagi/MobileShell";
import { AppHeader } from "@/components/yagi/AppHeader";
import { SkinWellnessCard } from "@/components/yagi/SkinWellnessCard";
import { QuickActions } from "@/components/yagi/QuickActions";
import { SkinScanHero } from "@/components/yagi/SkinScanHero";
import { InsightCards } from "@/components/yagi/InsightCards";
import { ProductGrid } from "@/components/yagi/ProductGrid";

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

    const handleScan = () =>
        toast("Starting skin scan", { description: "Position your face in good lighting." });

    const handleAction = (key) => {
        if (key === "routine") return navigate("/routine");
        if (key === "shop") return navigate("/shop");
        handleScan();
    };

    const sections = [
        <SkinWellnessCard key="wellness" />,
        <QuickActions key="quick" onAction={handleAction} />,
        <SkinScanHero key="hero" onScan={handleScan} />,
        <InsightCards key="insights" onConsult={() => navigate("/routine")} />,
        <ProductGrid key="products" />,
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

                {sections.map((node, i) => (
                    <motion.div key={node.key} custom={i + 1} variants={fadeUp} initial="hidden" animate="show">
                        {node}
                    </motion.div>
                ))}
            </div>
        </MobileShell>
    );
}
