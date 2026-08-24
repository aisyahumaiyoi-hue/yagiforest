import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    Bell,
    User,
    Check,
    ChevronRight,
    ScanFace,
    MessageCircle,
    Sparkles,
    Award,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { Wordmark } from "@/components/yagi/Wordmark";
import { BottomSheet } from "@/components/yagi/BottomSheet";
import { useYagi } from "@/store/YagiContext";
import { getProductById, USER_IMPACT } from "@/data/products";
import { toast } from "sonner";

const WEEK = [
    { d: "M", n: 17, done: 1 },
    { d: "T", n: 18, done: 0.8 },
    { d: "W", n: 19, done: 1 },
    { d: "T", n: 20, done: 0.4, today: true },
    { d: "F", n: 21, done: 0 },
    { d: "S", n: 22, done: 0 },
    { d: "S", n: 23, done: 0 },
];

const ProgressRing = ({ value, size = 44 }) => {
    const r = (size - 6) / 2;
    const c = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(140 20% 88%)" strokeWidth="5" />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="hsl(120 45% 48%)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - value)}
            />
        </svg>
    );
};

const RoutineTask = ({ step, product, index, onToggle }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="routine-task rounded-[18px]" data-done={step.completed}>
            <button onClick={() => setOpen((o) => !o)} className="focus-ring flex w-full items-center gap-3 p-3 text-left">
                <button
                    aria-label={step.completed ? "Mark not done" : "Mark done"}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(step.id);
                    }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                        step.completed
                            ? "border-transparent bg-gradient-to-br from-[hsl(96_58%_84%)] to-[hsl(116_44%_66%)] text-primary"
                            : "border-[hsl(140_22%_70%)] text-transparent"
                    }`}
                >
                    {step.completed ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="text-[11px] font-semibold text-muted-foreground">{index}</span>}
                </button>
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[12px] bg-pale/50">
                    {product && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className={`min-w-0 flex-1 ${step.completed ? "opacity-70" : ""}`}>
                    <p className="text-[13px] font-semibold text-foreground">{step.stage}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{product?.shortName}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{step.instruction.split(" ").slice(0, 3).join(" ")}</span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3">
                            <p className="rounded-[12px] bg-pale/60 p-3 text-[12px] leading-relaxed text-muted-foreground">
                                {step.instruction}
                            </p>
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => onToggle(step.id)}
                                    className="btn-green focus-ring flex-1 rounded-[12px] py-2 text-[12.5px] font-semibold"
                                >
                                    {step.completed ? "Mark not done" : "Mark done"}
                                </button>
                                <button
                                    onClick={() => toast("Step skipped for today")}
                                    className="glass-control focus-ring rounded-[12px] px-4 py-2 text-[12.5px] font-medium text-secondary"
                                >
                                    Skip
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Routine() {
    const navigate = useNavigate();
    const { routine, toggleStep, setRoutine } = useYagi();
    const [segment, setSegment] = useState("morning");
    const [devTool, setDevTool] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [snapshot, setSnapshot] = useState(null);

    const morning = routine.filter((s) => s.period === "morning").sort((a, b) => a.order - b.order);
    const evening = routine.filter((s) => s.period === "evening").sort((a, b) => a.order - b.order);
    const list = segment === "morning" ? morning : evening;

    const doneCount = routine.filter((s) => s.completed).length;
    const progress = routine.length ? doneCount / routine.length : 0;

    const productsInRoutine = useMemo(() => {
        const ids = [...new Set(routine.map((s) => s.productId))];
        return ids.map((id) => getProductById(id)).filter(Boolean);
    }, [routine]);

    const move = (id, dir) => {
        setRoutine((prev) => {
            const arr = [...prev];
            const i = arr.findIndex((s) => s.id === id);
            const j = i + dir;
            if (j < 0 || j >= arr.length || arr[i].period !== arr[j].period) return prev;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            return arr.map((s, idx) => ({ ...s, order: idx }));
        });
    };
    const removeStep = (id) => setRoutine((prev) => prev.filter((s) => s.id !== id));

    return (
        <MobileShell>
            {/* Header */}
            <header
                className="sticky top-0 z-20 flex items-center gap-2 px-4 pb-2.5"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
            >
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(46_40%_98%/0.92)] to-[hsl(46_40%_98%/0)] backdrop-blur-[6px]" />
                <Wordmark className="flex-1" />
                {[Calendar, Bell, User].map((Icon, i) => (
                    <button
                        key={i}
                        aria-label={["Calendar", "Notifications", "Profile"][i]}
                        className="glass-control focus-ring grid h-10 w-10 place-items-center rounded-[14px]"
                    >
                        <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.9} />
                    </button>
                ))}
            </header>

            <div
                className="flex flex-col gap-3.5 px-4 pt-1"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" }}
            >
                <div className="pt-1">
                    <p className="text-[11.5px] font-medium text-secondary">Thursday, 20 Aug</p>
                    <h1 className="font-serif-display text-[24px] leading-tight text-foreground">Your skin routine</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">A simple plan built around your skin.</p>
                </div>

                {/* Today card */}
                <div className="glass-shell rounded-[26px]">
                    <div className="inner-card rounded-[22px] p-4">
                        <div className="flex items-center gap-3">
                            <div className="relative grid place-items-center">
                                <ProgressRing value={progress} />
                                <span className="absolute text-[11px] font-bold text-primary">{Math.round(progress * 100)}%</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-semibold text-foreground">Today</p>
                                <p className="text-[12px] text-muted-foreground">
                                    {doneCount} of {routine.length} done
                                </p>
                            </div>
                        </div>

                        {/* Segmented */}
                        <div className="segmented mt-3 flex gap-1 rounded-[14px] p-1">
                            {[
                                { key: "morning", label: `Morning ${morning.filter((s) => s.completed).length}/${morning.length}` },
                                { key: "evening", label: `Evening ${evening.filter((s) => s.completed).length}/${evening.length}` },
                            ].map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSegment(s.key)}
                                    className={`focus-ring flex-1 rounded-[11px] py-2 text-[12px] font-medium transition-colors ${
                                        segment === s.key ? "segmented-active" : "text-muted-foreground"
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                            {list.map((step, i) => (
                                <RoutineTask
                                    key={step.id}
                                    step={step}
                                    index={i + 1}
                                    product={getProductById(step.productId)}
                                    onToggle={toggleStep}
                                />
                            ))}
                            {list.every((s) => s.completed) && list.length > 0 && (
                                <p className="py-1 text-center text-[12px] font-medium text-secondary">
                                    Routine complete for this segment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skin context */}
                <div className="glass-shell rounded-[24px]">
                    <div className="inner-card rounded-[20px] p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[13.5px] font-semibold text-foreground">Today’s skin context</p>
                            <span className="rounded-full bg-pale px-2.5 py-1 text-[10.5px] font-medium text-secondary">
                                Barrier improving
                            </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {[
                                { t: "Hydration", v: "Good" },
                                { t: "Redness", v: "Low" },
                                { t: "Comfort", v: "High" },
                            ].map((m) => (
                                <div key={m.t} className="rounded-[13px] bg-pale/60 p-2.5">
                                    <p className="text-[11px] text-muted-foreground">{m.t}</p>
                                    <p className="text-[14px] font-semibold text-foreground">{m.v}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => toast("Skin progress")}
                            className="focus-ring mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-secondary"
                        >
                            View progress <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Premium feature cards */}
                <div className="grid grid-cols-2 gap-2.5">
                    {[
                        { key: "analyzer", Icon: ScanFace, title: "Skin analyzer", desc: "Understand visible changes and update your routine.", cta: "Open", live: false },
                        { key: "agent", Icon: MessageCircle, title: "Ask YAGI", desc: "Ask about your routine, products and general eczema care.", cta: "Ask YAGI", live: true },
                    ].map(({ key, Icon, title, desc, cta, live }) => (
                        <div key={key} className="glass-shell rounded-[22px]">
                            <div className="impact-glass relative flex h-full flex-col rounded-[18px] p-3.5">
                                <Sparkles className="absolute right-2 top-2 h-8 w-8 text-[hsl(120_40%_80%)]" strokeWidth={1.2} />
                                <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-white/70">
                                    <Icon className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                                </span>
                                <p className="mt-2 text-[13px] font-semibold text-foreground">{title}</p>
                                <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">{desc}</p>
                                {!live && (
                                    <span className="mt-1.5 w-fit rounded-full bg-pale px-2 py-[2px] text-[9.5px] font-medium text-secondary">
                                        Coming soon
                                    </span>
                                )}
                                <button
                                    onClick={() => (live ? navigate("/ask-yagi") : setDevTool(title))}
                                    className="btn-green focus-ring mt-auto rounded-[12px] py-2 text-[12px] font-semibold"
                                >
                                    {cta}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* This week */}
                <div>
                    <p className="mb-2 text-[13.5px] font-semibold text-foreground">This week</p>
                    <div className="flex justify-between gap-1">
                        {WEEK.map((day) => (
                            <div
                                key={day.n}
                                className={`flex flex-1 flex-col items-center rounded-[14px] py-2 ${
                                    day.today ? "bg-gradient-to-b from-[hsl(96_58%_92%)] to-[hsl(112_40%_84%)]" : ""
                                }`}
                            >
                                <span className="text-[10px] text-muted-foreground">{day.d}</span>
                                <span className={`text-[13px] font-semibold ${day.today ? "text-primary" : "text-foreground"}`}>
                                    {day.n}
                                </span>
                                <span
                                    className="mt-1 h-1.5 w-1.5 rounded-full"
                                    style={{ background: day.done >= 1 ? "hsl(120 48% 46%)" : day.done > 0 ? "hsl(96 45% 62%)" : "hsl(140 15% 82%)" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Routine progress */}
                <div className="glass-shell rounded-[20px]">
                    <div className="inner-card rounded-[16px] p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[13px] font-semibold text-foreground">Routine progress</p>
                            <span className="text-[13px] font-semibold text-primary">{USER_IMPACT.weeklyRoutine}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-pale">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[hsl(96_55%_66%)] to-[hsl(120_45%_50%)]"
                                style={{ width: `${USER_IMPACT.weeklyRoutine}%` }}
                            />
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                            Consistency helps make your routine easier to follow.
                        </p>
                    </div>
                </div>

                {/* Products in routine */}
                <div>
                    <p className="mb-2 text-[13.5px] font-semibold text-foreground">Products in your routine</p>
                    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
                        {productsInRoutine.map((p, i) => {
                            const daysLeft = [12, 8, 20, 15][i % 4];
                            const low = daysLeft <= 8;
                            return (
                                <div key={p.id} className="glass-shell w-[150px] shrink-0 rounded-[20px]">
                                    <div className="inner-card overflow-hidden rounded-[16px]">
                                        <div className="h-20 overflow-hidden bg-pale/40">
                                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="p-2.5">
                                            <p className="truncate text-[12px] font-semibold text-foreground">{p.shortName}</p>
                                            <p className={`text-[10.5px] ${low ? "text-[hsl(38_60%_45%)]" : "text-muted-foreground"}`}>
                                                About {daysLeft} days left
                                            </p>
                                            <button
                                                onClick={() => navigate(`/product/${p.slug}`)}
                                                className="glass-control focus-ring mt-2 w-full rounded-[11px] py-1.5 text-[11.5px] font-semibold text-secondary"
                                            >
                                                Restock
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Adjust routine */}
                <div className="glass-shell rounded-[20px]">
                    <div className="inner-card rounded-[16px] p-4">
                        <p className="text-[13px] font-semibold text-foreground">Adjust your routine</p>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">Update steps, timing or products anytime.</p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => {
                                    setSnapshot(routine);
                                    setEditOpen(true);
                                }}
                                className="btn-green focus-ring flex-1 rounded-[13px] py-2.5 text-[13px] font-semibold"
                            >
                                Edit routine
                            </button>
                            <button
                                onClick={() => navigate("/shop")}
                                className="glass-control focus-ring flex-1 rounded-[13px] py-2.5 text-[13px] font-medium text-secondary"
                            >
                                Add product
                            </button>
                        </div>
                    </div>
                </div>

                {/* Care impact */}
                <div className="glass-shell rounded-[24px]">
                    <div className="impact-glass rounded-[20px] p-4">
                        <p className="text-[13.5px] font-semibold text-foreground">Your care impact</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {[
                                { t: "Refills used", v: "4" },
                                { t: "Packaging avoided", v: `${USER_IMPACT.plasticAvoided} bottles` },
                                { t: "Responsible purchases", v: `${USER_IMPACT.purchases}` },
                                { t: "Local impact", v: `${USER_IMPACT.localNetworks} network` },
                            ].map((m) => (
                                <div key={m.t} className="inner-card rounded-[13px] p-3">
                                    <p className="text-[15px] font-semibold text-primary">{m.v}</p>
                                    <p className="text-[10.5px] text-muted-foreground">{m.t}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => toast("Impact details")}
                            className="focus-ring mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-secondary"
                        >
                            View impact details <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-3 text-[10.5px] text-muted-foreground">
                            <Award className="h-3.5 w-3.5 text-[hsl(150_35%_34%)]" strokeWidth={1.9} />
                            YAGI · 1st place ASEAN SEDP 2025
                        </div>
                    </div>
                </div>
            </div>

            {/* Development modal */}
            <BottomSheet open={!!devTool} onClose={() => setDevTool(null)} maxH="52%">
                <div className="flex flex-col items-center pb-4 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-[hsl(96_58%_90%)] to-[hsl(116_44%_74%)]">
                        <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.8} />
                    </span>
                    <h3 className="font-serif-display mt-4 text-[21px] text-foreground">We’re building this carefully.</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {devTool} is currently in development. It will help connect your routine, products and skin
                        insights in one place.
                    </p>
                    <button
                        onClick={() => setDevTool(null)}
                        className="btn-green focus-ring mt-5 w-full rounded-[15px] py-3 text-[14px] font-semibold"
                    >
                        Got it
                    </button>
                    <button onClick={() => setDevTool(null)} className="mt-2 text-[12.5px] font-medium text-secondary">
                        Join early access
                    </button>
                </div>
            </BottomSheet>

            {/* Edit routine sheet */}
            <BottomSheet
                open={editOpen}
                onClose={() => setEditOpen(false)}
                title="Edit routine"
                footer={
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (snapshot) setRoutine(snapshot);
                                setEditOpen(false);
                            }}
                            className="glass-control focus-ring rounded-[14px] px-5 py-3 text-[13px] font-medium text-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setEditOpen(false);
                                toast("Routine saved");
                            }}
                            className="btn-green focus-ring flex-1 rounded-[15px] py-3 text-[14px] font-semibold"
                        >
                            Save routine
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-2 pb-2">
                    {routine.map((s, i) => {
                        const p = getProductById(s.productId);
                        return (
                            <div key={s.id} className="routine-task flex items-center gap-2.5 rounded-[14px] p-2.5">
                                <div className="flex flex-col">
                                    <button onClick={() => move(s.id, -1)} aria-label="Move up" className="text-muted-foreground active:scale-90">
                                        <ArrowUp className="h-4 w-4" strokeWidth={2} />
                                    </button>
                                    <button onClick={() => move(s.id, 1)} aria-label="Move down" className="text-muted-foreground active:scale-90">
                                        <ArrowDown className="h-4 w-4" strokeWidth={2} />
                                    </button>
                                </div>
                                <div className="h-9 w-9 overflow-hidden rounded-[10px] bg-pale/50">
                                    {p && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12.5px] font-semibold text-foreground">{s.stage}</p>
                                    <p className="text-[10.5px] capitalize text-muted-foreground">
                                        {s.period} · {p?.shortName}
                                    </p>
                                </div>
                                <button onClick={() => removeStep(s.id)} aria-label="Remove step" className="text-muted-foreground active:scale-90">
                                    <Trash2 className="h-[17px] w-[17px]" strokeWidth={1.9} />
                                </button>
                            </div>
                        );
                    })}
                    <button
                        onClick={() => navigate("/shop")}
                        className="glass-control focus-ring mt-1 inline-flex items-center justify-center gap-1.5 rounded-[13px] py-3 text-[13px] font-medium text-secondary"
                    >
                        <Plus className="h-4 w-4" strokeWidth={2.2} /> Add step
                    </button>
                </div>
            </BottomSheet>
        </MobileShell>
    );
}
