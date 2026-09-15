import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Leaf,
    HeartHandshake,
    Users,
    ScanFace,
    BrainCircuit,
    ShieldCheck,
    Sprout,
    ArrowRight,
    Check,
    MessagesSquare,
    Bot,
    LineChart,
    Trophy,
    Star,
} from "lucide-react";
import { HERO_IMAGE, IMPACT_BG } from "@/data/products";
import { IMG } from "@/data/products";

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const PILLARS = [
    {
        icon: HeartHandshake,
        title: "Customer experience",
        desc: "Guided routines, an AI skin scan and honest education for every eczema journey.",
    },
    {
        icon: Users,
        title: "Customer reach",
        desc: "Loyalty, rewards and community that grow the Yagi family across Indonesia.",
    },
    {
        icon: BrainCircuit,
        title: "AI efficiency",
        desc: "Marketing that learns, follows up and optimises itself — saving hours every week.",
    },
];

const FEATURES = [
    { icon: ScanFace, label: "AI skin scan & routine" },
    { icon: MessagesSquare, label: "Support & customer care" },
    { icon: LineChart, label: "Marketing intelligence" },
    { icon: Bot, label: "AI-powered efficiency" },
];

const HERO_PRODUCTS = [
    { name: "Calm Barrier Moisturizer", price: "Rp189k", image: IMG.moisturizer },
    { name: "Relief & Repair Serum", price: "Rp249k", image: IMG.serum },
    { name: "Soothing Healing Balm", price: "Rp159k", image: IMG.balm },
];

export default function Onboarding() {
    const navigate = useNavigate();

    const enter = () => {
        try {
            localStorage.setItem("yagi_onboarded", "1");
        } catch {
            /* noop */
        }
        navigate("/");
    };

    return (
        <div className="device-frame">
            <div
                className="scroll-area"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}
            >
                <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="flex flex-col px-5">
                    {/* ---------- top bar ---------- */}
                    <motion.div variants={fadeUp} className="flex items-center justify-between">
                        <span className="font-serif-display text-[24px] leading-none tracking-tight text-primary">
                            Yagi
                        </span>
                        <button
                            onClick={enter}
                            className="glass-control focus-ring rounded-full px-4 py-2 text-[12.5px] font-semibold text-secondary"
                        >
                            Skip
                        </button>
                    </motion.div>

                    {/* ---------- hero ---------- */}
                    <motion.div variants={fadeUp} className="mt-5">
                        <div className="glass-shell rounded-[28px]">
                            <div className="inner-card overflow-hidden rounded-[24px]">
                                <div className="relative h-[240px] w-full overflow-hidden">
                                    <img
                                        src={HERO_IMAGE}
                                        alt="Yagi Natural eczema care"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(152_42%_18%/0.85)] via-[hsl(152_42%_18%/0.25)] to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[10.5px] font-semibold tracking-wide text-white backdrop-blur-md">
                                            <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
                                            Eczema care, made in Indonesia
                                        </span>
                                        <h1 className="font-serif-display mt-2.5 text-balance text-[30px] leading-[1.05] text-white">
                                            Skin that feels like home.
                                        </h1>
                                    </div>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-balance text-[13.5px] leading-relaxed text-muted-foreground">
                                        Yagi Natural is an eczema brand built with dermatologists — and this app
                                        runs the whole customer journey: experience, reach and AI-powered marketing,
                                        in one calm place.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {["Dermatologist-reviewed", "BPOM", "Halal", "Refillable"].map((t) => (
                                            <span key={t} className="rounded-full border border-[hsl(140_22%_55%/0.22)] bg-pale/70 px-2.5 py-1 text-[10.5px] font-medium text-secondary">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ---------- featured products ---------- */}
                    <motion.div variants={fadeUp} className="mt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-serif-display text-[20px] text-primary">Loved by sensitive skin</h2>
                            <button onClick={() => navigate("/shop")} className="flex items-center gap-1 text-[12px] font-semibold text-secondary">
                                Shop all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                            </button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            {HERO_PRODUCTS.map((p) => (
                                <div key={p.name} className="glass-shell w-[132px] shrink-0 rounded-[22px]">
                                    <div className="inner-card overflow-hidden rounded-[18px]">
                                        <div className="relative h-[108px] w-full overflow-hidden">
                                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-center gap-0.5 text-[#e8b341]">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="text-[10px] font-semibold text-foreground">4.9</span>
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-tight text-foreground">{p.name}</p>
                                            <p className="mt-1 text-[11.5px] font-semibold text-secondary">{p.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ---------- pillars ---------- */}
                    <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-3">
                        {PILLARS.map((p) => (
                            <div key={p.title} className="glass-shell rounded-[22px]">
                                <div className="inner-card flex items-start gap-3.5 rounded-[18px] p-4">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-[hsl(140_24%_52%/0.24)] bg-pale/70">
                                        <p.icon className="h-5 w-5 text-secondary" strokeWidth={1.9} />
                                    </span>
                                    <div>
                                        <p className="text-[14.5px] font-semibold text-foreground">{p.title}</p>
                                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{p.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* ---------- impact image band ---------- */}
                    <motion.div variants={fadeUp} className="mt-6">
                        <div className="glass-shell rounded-[26px]">
                            <div className="inner-card overflow-hidden rounded-[22px]">
                                <div className="relative h-[180px] w-full overflow-hidden">
                                    <img src={IMPACT_BG} alt="Yagi impact" className="absolute inset-0 h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(152_42%_18%/0.82)] to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[hsl(112_55%_75%)]">Our promise</p>
                                        <p className="font-serif-display mt-1 text-[20px] leading-snug text-white">
                                            Gentler on skin, kinder to the planet.
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 text-[11.5px] text-white/90">
                                            <Sprout className="h-4 w-4" strokeWidth={1.9} />
                                            Refillable, low-waste, locally sourced
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ---------- features ---------- */}
                    <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-2.5">
                        {FEATURES.map((f) => (
                            <div key={f.label} className="glass-control flex items-center gap-2 rounded-[16px] px-3 py-2.5">
                                <f.icon className="h-4 w-4 shrink-0 text-secondary" strokeWidth={1.9} />
                                <span className="text-[11.5px] font-medium leading-tight text-foreground">{f.label}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* ---------- contest ---------- */}
                    <motion.div variants={fadeUp} className="impact-glass mt-6 rounded-[24px] p-5">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-[hsl(42_60%_50%)]" strokeWidth={1.9} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                                Building Indonesia · AI contest
                            </span>
                        </div>
                        <p className="mt-3 text-balance text-[13px] leading-relaxed text-foreground">
                            Built for the{" "}
                            <span className="font-semibold">Building Indonesia — Builders Contest</span> by Emergent: a
                            free, no-code AI app contest solving one real business problem. 100 winners share{" "}
                            <span className="font-semibold">Rp800 million</span>.
                        </p>
                        <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[hsl(140_22%_55%/0.22)] bg-white/60 px-4 py-3">
                            <div>
                                <p className="text-[10.5px] font-medium text-muted-foreground">Submissions close</p>
                                <p className="text-[13px] font-semibold text-foreground">05 Sept 2026 · 23:59 WIB</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10.5px] font-medium text-muted-foreground">Online · Indonesia</p>
                                <p className="text-[13px] font-semibold text-foreground">10 Aug – 05 Sept</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-secondary" strokeWidth={1.9} />
                            A real tool for a real problem — eczema care, end to end.
                        </div>
                    </motion.div>

                    {/* ---------- final CTA ---------- */}
                    <motion.div variants={fadeUp} className="mt-6 pb-2">
                        <button
                            onClick={enter}
                            className="btn-green focus-ring flex w-full items-center justify-center gap-2 rounded-[18px] py-4 text-[15px] font-semibold"
                        >
                            Enter Yagi
                            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
                        </button>
                        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-secondary" strokeWidth={2.4} />
                            Dermatologist-reviewed · gentle by design
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
