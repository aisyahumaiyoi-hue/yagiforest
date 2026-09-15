import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Heart,
    Share2,
    ShoppingBag,
    Sparkles,
    Check,
    Truck,
    ChevronRight,
    ChevronDown,
    Plus,
    Minus,
    Droplets,
    ShieldCheck,
    Leaf,
    X,
    BadgeCheck,
} from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { Wordmark } from "@/components/yagi/Wordmark";
import { Stars } from "@/components/yagi/Stars";
import { ImpactCard, AwardProof } from "@/components/yagi/Impact";
import { BottomSheet } from "@/components/yagi/BottomSheet";
import { ShopProductCard } from "@/components/yagi/ShopProductCard";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const STAGES = ["Cleanse", "Treat", "Moisturize"];
const HELPS = [
    { Icon: Droplets, text: "Locks in moisture" },
    { Icon: ShieldCheck, text: "Supports the skin barrier" },
    { Icon: Leaf, text: "Calms the feel of dry skin" },
    { Icon: Heart, text: "Designed for sensitive routines" },
];
const REVIEW_FILTERS = ["All", "Eczema-prone", "Dry skin", "Sensitive", "Texture", "Repurchase"];

const Accordion = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-shell rounded-[18px]">
            <div className="inner-card overflow-hidden rounded-[14px]">
                <button
                    onClick={() => setOpen((o) => !o)}
                    className="focus-ring flex w-full items-center justify-between px-4 py-3.5 text-left"
                >
                    <span className="text-[13.5px] font-semibold text-foreground">{title}</span>
                    <ChevronDown
                        className={`h-4 w-4 text-secondary transition-transform ${open ? "rotate-180" : ""}`}
                        strokeWidth={2}
                    />
                </button>
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 text-[12.5px] leading-relaxed text-muted-foreground">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleSaved, isSaved, addToRoutine, cartCount, getProductBySlug, products, shipping } = useYagi();
    const product = useMemo(() => getProductBySlug(slug) || products[0], [slug, getProductBySlug, products]);

    const [activeImg, setActiveImg] = useState(0);
    const [variant, setVariant] = useState(product.variants?.[product.variants.length > 1 ? 1 : 0]?.id);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [viewer, setViewer] = useState(false);
    const [matchOpen, setMatchOpen] = useState(false);
    const [reviewFilter, setReviewFilter] = useState("All");
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (product?.id) {
            api.productReviews(product.id).then((r) => setReviews(r.items || [])).catch(() => setReviews([]));
        }
    }, [product?.id]);

    const saved = isSaved(product.id);
    const activeVariant = product.variants?.find((v) => v.id === variant) || product.variants?.[0];
    const price = activeVariant?.price || product.price;

    const shippingEta = useMemo(() => {
        const eta = (shipping || []).find((s) => s.id === "regular")?.eta;
        return eta ? `arrives ${eta.replace(/^Arrives\s+/i, "")}` : "arrives in 2–4 days";
    }, [shipping]);

    const shownReviews = reviews.filter((r) => reviewFilter === "All" || r.tag === reviewFilter);

    const handleAdd = () => {
        addToCart(product.id, variant, qty);
        setAdded(true);
        toast("Added to bag", { description: `${product.name} · ${activeVariant?.label}` });
        setTimeout(() => setAdded(false), 1600);
    };

    return (
        <MobileShell
            nav={false}
            footer={
                <div
                    className="sticky-purchase-bar absolute inset-x-0 bottom-0 z-30 px-4 pt-3"
                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
                >
                    <div className="flex items-center gap-3">
                        <div className="shrink-0">
                            <p className="text-[10px] text-muted-foreground">{activeVariant?.label}</p>
                            <p className="text-[16px] font-semibold text-primary">{formatIDR(price)}</p>
                        </div>
                        <div className="quantity-control flex items-center gap-1 rounded-[13px] px-1 py-1">
                            <button
                                aria-label="Decrease quantity"
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                className="grid h-8 w-8 place-items-center rounded-[10px] text-secondary active:scale-90"
                            >
                                <Minus className="h-4 w-4" strokeWidth={2.2} />
                            </button>
                            <span className="w-5 text-center text-[14px] font-semibold text-foreground">{qty}</span>
                            <button
                                aria-label="Increase quantity"
                                onClick={() => setQty((q) => q + 1)}
                                className="grid h-8 w-8 place-items-center rounded-[10px] text-secondary active:scale-90"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.2} />
                            </button>
                        </div>
                        <button
                            onClick={added ? () => navigate("/cart") : handleAdd}
                            className="btn-green focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-[15px] py-3 text-[14px] font-semibold"
                        >
                            {added ? (
                                <>
                                    <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
                                    View bag
                                </>
                            ) : (
                                "Add to bag"
                            )}
                        </button>
                    </div>
                </div>
            }
        >
            {/* Top bar */}
            <header
                className="sticky top-0 z-20 flex items-center gap-2 px-4 pb-2.5"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
            >
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(46_40%_98%/0.92)] to-[hsl(46_40%_98%/0)] backdrop-blur-[6px]" />
                <button
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    className="glass-control focus-ring grid h-10 w-10 place-items-center rounded-[14px]"
                >
                    <ChevronDown className="h-5 w-5 rotate-90 text-primary" strokeWidth={2} />
                </button>
                <div className="flex-1 text-center">
                    <Wordmark className="text-[22px]" />
                </div>
                <button
                    aria-label={saved ? "Remove from saved" : "Save product"}
                    onClick={() => toggleSaved(product.id)}
                    className="glass-control focus-ring grid h-10 w-10 place-items-center rounded-[14px]"
                >
                    <Heart
                        className={`h-[18px] w-[18px] ${saved ? "fill-[hsl(4_72%_60%)] text-[hsl(4_72%_60%)]" : "text-primary"}`}
                        strokeWidth={1.9}
                    />
                </button>
                <button
                    aria-label="Share"
                    onClick={() => toast("Link copied")}
                    className="glass-control focus-ring grid h-10 w-10 place-items-center rounded-[14px]"
                >
                    <Share2 className="h-[17px] w-[17px] text-primary" strokeWidth={1.9} />
                </button>
                <button
                    aria-label="Cart"
                    onClick={() => navigate("/cart")}
                    className="glass-control focus-ring relative grid h-10 w-10 place-items-center rounded-[14px]"
                >
                    <ShoppingBag className="h-[17px] w-[17px] text-primary" strokeWidth={1.9} />
                    {cartCount > 0 && (
                        <span className="absolute -right-1 -top-1 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-[hsl(142_36%_38%)] px-1 text-[9px] font-bold text-white">
                            {cartCount}
                        </span>
                    )}
                </button>
            </header>

            <div className="flex flex-col gap-3.5 px-4 pt-1 pb-40">
                {/* Gallery */}
                <div className="glass-shell rounded-[28px]">
                    <div className="inner-card overflow-hidden rounded-[24px]">
                        <button
                            onClick={() => setViewer(true)}
                            className="relative block aspect-square w-full overflow-hidden bg-pale/40"
                        >
                            <img src={product.images[activeImg]} alt={product.name} className="h-full w-full object-cover" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    {product.images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`h-14 w-14 overflow-hidden rounded-[14px] border-2 ${
                                activeImg === i ? "border-[hsl(120_45%_55%)]" : "border-transparent"
                            }`}
                        >
                            <img src={img} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>

                {/* Hierarchy */}
                <div>
                    <p className="text-[11.5px] font-medium tracking-wide text-secondary">{product.category || "Barrier care"}</p>
                    <h1 className="font-serif-display mt-0.5 text-[24px] leading-tight text-foreground">{product.name}</h1>
                    <p className="mt-1 text-[13px] text-muted-foreground">{product.purpose}</p>
                    <div className="mt-2 flex items-center gap-3">
                        <Stars rating={product.rating} count={`${product.reviewCount} reviews`} size={14} />
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-[22px] font-semibold text-primary">{formatIDR(price)}</span>
                        <span className="mb-0.5 text-[11.5px] text-muted-foreground">
                            {product.unit} · {product.unitPrice}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate(`/ask-yagi?product_id=${product.id}&product_name=${encodeURIComponent(product.shortName)}`)}
                        className="glass-control focus-ring mt-3 inline-flex items-center gap-1.5 rounded-[12px] px-3 py-2 text-[12px] font-semibold text-secondary"
                    >
                        <Sparkles className="h-4 w-4" strokeWidth={2} /> Ask YAGI about this
                    </button>
                </div>

                {/* Variants */}
                {product.variants?.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => {
                            const active = v.id === variant;
                            return (
                                <button
                                    key={v.id}
                                    data-active={active}
                                    onClick={() => setVariant(v.id)}
                                    className="filter-chip focus-ring rounded-[13px] px-4 py-2 text-[12.5px] font-medium"
                                >
                                    {v.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Stock + shipping */}
                <div className="glass-shell rounded-[20px]">
                    <div className="inner-card flex items-center gap-3 rounded-[16px] p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-secondary">
                            <span className="h-2 w-2 rounded-full bg-[hsl(112_50%_46%)]" />
                            Ready to ship
                        </span>
                        <span className="mx-1 h-4 w-px bg-border" />
                        <Truck className="h-[17px] w-[17px] shrink-0 text-secondary" strokeWidth={1.9} />
                        <p className="text-[12px] text-muted-foreground">
                            Order today · <span className="font-medium text-foreground">{shippingEta}</span>
                        </p>
                    </div>
                </div>

                {/* Why this fits your skin */}
                <div className="glass-shell rounded-[26px]">
                    <div className="impact-glass rounded-[22px] p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="h-[17px] w-[17px] text-secondary" strokeWidth={2} />
                                <span className="text-[13.5px] font-semibold text-foreground">Why this fits your skin</span>
                            </div>
                            <span className="heart-chip inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold text-secondary">
                                {product.matchScore}% match
                            </span>
                        </div>
                        <div className="mt-3 space-y-2">
                            {product.matchReasons.map((r) => (
                                <div key={r} className="flex items-center gap-2 text-[12.5px] text-foreground">
                                    <Check className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2.2} />
                                    {r}
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-[11px] text-muted-foreground">Based on your latest skin profile</p>
                        <button
                            onClick={() => setMatchOpen(true)}
                            className="focus-ring mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-secondary"
                        >
                            View match details
                            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Routine position */}
                <div className="glass-shell rounded-[22px]">
                    <div className="inner-card rounded-[18px] p-4">
                        <p className="text-[13.5px] font-semibold text-foreground">Where it fits</p>
                        <div className="mt-3 flex items-center gap-1.5">
                            {STAGES.map((stage, i) => {
                                const active = product.routineStage === stage.toLowerCase();
                                return (
                                    <div key={stage} className="flex items-center gap-1.5">
                                        <span
                                            className={`rounded-[11px] px-3 py-2 text-[11.5px] font-medium ${
                                                active
                                                    ? "segmented-active"
                                                    : "bg-pale/60 text-muted-foreground"
                                            }`}
                                        >
                                            {stage}
                                        </span>
                                        {i < STAGES.length - 1 && (
                                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-[12px] text-muted-foreground">{product.usage}</p>
                        <button
                            onClick={() => {
                                addToRoutine(product);
                                toast("Added to routine", { description: "Find it on your Routine tab." });
                            }}
                            className="btn-green focus-ring mt-3 w-full rounded-[14px] py-2.5 text-[13px] font-semibold"
                        >
                            Add to routine
                        </button>
                    </div>
                </div>

                {/* What it helps with */}
                <div>
                    <h3 className="font-serif-display mb-2 text-[18px] text-foreground">What it helps with</h3>
                    <div className="glass-shell rounded-[22px]">
                        <div className="inner-card divide-y divide-border/60 rounded-[18px] px-4">
                            {HELPS.map(({ Icon, text }) => (
                                <div key={text} className="flex items-center gap-3 py-3">
                                    <span className="grid h-8 w-8 place-items-center rounded-[11px] bg-pale/80">
                                        <Icon className="h-[17px] w-[17px] text-secondary" strokeWidth={1.9} />
                                    </span>
                                    <span className="text-[13px] text-foreground">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ingredient intelligence */}
                <div>
                    <h3 className="font-serif-display mb-2 text-[18px] text-foreground">Key ingredients</h3>
                    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
                        {product.ingredients.map((ing) => (
                            <div key={ing.name} className="glass-shell w-[130px] shrink-0 rounded-[20px]">
                                <div className="inner-card overflow-hidden rounded-[16px]">
                                    <div className="h-20 overflow-hidden bg-pale/40">
                                        <img src={ing.image} alt={ing.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="p-2.5">
                                        <p className="text-[12px] font-semibold text-foreground">{ing.name}</p>
                                        <p className="text-[10.5px] leading-tight text-muted-foreground">{ing.purpose}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accordions */}
                <div className="flex flex-col gap-2.5">
                    <Accordion title="Full ingredient list">
                        Aqua, Cocos Nucifera (Coconut) Oil, Glycerin, Butyrospermum Parkii (Shea) Butter,
                        Pogostemon Cablin (Patchouli) Oil, Tocopherol, and other skin-friendly botanicals.
                    </Accordion>
                    <Accordion title="How to use">{product.usage} Use daily for best comfort.</Accordion>
                    <Accordion title="Who it is for">
                        Formulated for dry, eczema-prone and sensitive skin, including reactive and easily
                        irritated skin types.
                    </Accordion>
                    <Accordion title="Safety & certifications">
                        <div className="flex flex-wrap gap-2">
                            {product.certifications.map((c) => (
                                <span key={c} className="rounded-full bg-pale px-3 py-1 text-[11.5px] font-medium text-secondary">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </Accordion>
                    <Accordion title="Shipping & returns">
                        Ships within 1 business day. Easy 14-day returns on unopened items.
                    </Accordion>
                </div>

                {/* Impact */}
                <ImpactCard
                    product={product}
                    onMethodology={() =>
                        toast("How we calculate this", {
                            description: product.impact?.methodology || "Estimated from refill vs. single-use packaging.",
                        })
                    }
                />

                {/* If you buy this */}
                <div className="glass-shell rounded-[22px]">
                    <div className="inner-card rounded-[18px] p-4">
                        <p className="text-[13.5px] font-semibold text-foreground">If you buy this</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {["+1 lower-waste purchase", "+ impact contribution", "+ local value supported"].map((t) => (
                                <div key={t} className="rounded-[12px] bg-pale/70 p-2.5 text-[10.5px] font-medium leading-tight text-secondary">
                                    {t}
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-[10px] text-muted-foreground">Contribution applied to your impact ledger on purchase</p>
                    </div>
                </div>

                <AwardProof onLearn={() => toast("Our impact story", { description: "Recognized by ASEAN SEDP 2025." })} />

                {/* Reviews */}
                <div>
                    <div className="flex items-end justify-between">
                        <h3 className="font-serif-display text-[18px] text-foreground">Loved by sensitive skin routines</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-[26px] font-semibold text-primary">{product.rating}</span>
                        <div>
                            <Stars rating={product.rating} size={14} />
                            <p className="text-[11px] text-muted-foreground">{product.reviewCount} reviews</p>
                        </div>
                    </div>

                    <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
                        {REVIEW_FILTERS.map((f) => (
                            <button
                                key={f}
                                data-active={reviewFilter === f}
                                onClick={() => setReviewFilter(f)}
                                className="filter-chip focus-ring shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-medium"
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 flex flex-col gap-2.5">
                        {shownReviews.slice(0, 3).map((r) => {
                            const initial = (r.title?.[0] || "Y").toUpperCase();
                            const tag = r.tag || "Verified";
                            return (
                                <div key={r.id || r.created_at} className="glass-shell rounded-[20px]">
                                    <div className="inner-card rounded-[16px] p-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid h-8 w-8 place-items-center rounded-full bg-pale text-[13px] font-semibold text-secondary">
                                                {initial}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[12.5px] font-semibold text-foreground">{r.title || "YAGI customer"}</p>
                                                    <BadgeCheck className="h-3.5 w-3.5 text-secondary" strokeWidth={2} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Stars rating={r.rating} size={11} />
                                                    <span className="rounded-full bg-pale px-2 py-[1px] text-[9.5px] font-medium text-secondary">
                                                        {tag}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{r.body}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {shownReviews.length === 0 && (
                            <p className="py-4 text-center text-[12px] text-muted-foreground">No reviews yet.</p>
                        )}
                    </div>
                    <button
                        onClick={() => toast("All reviews")}
                        className="glass-control focus-ring mt-3 w-full rounded-[14px] py-3 text-[13px] font-medium text-secondary"
                    >
                        View all reviews
                    </button>
                </div>

                {/* Pairs well with */}
                <div>
                    <h3 className="font-serif-display mb-2 text-[18px] text-foreground">Pairs well with</h3>
                    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
                        {products.filter((p) => p.id !== product.id)
                            .slice(0, 3)
                            .map((p) => (
                                <div key={p.id} className="w-[150px] shrink-0">
                                    <ShopProductCard product={p} />
                                </div>
                            ))}
                    </div>
                </div>

                {/* Confidence strip */}
                <div className="glass-shell rounded-[20px]">
                    <div className="inner-card flex items-center justify-around rounded-[16px] px-2 py-3 text-center">
                        {["Sensitive-skin focused", "Responsible sourcing", "Easy returns"].map((t) => (
                            <span key={t} className="flex-1 px-1 text-[10.5px] font-medium leading-tight text-secondary">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Match details sheet */}
            <BottomSheet open={matchOpen} onClose={() => setMatchOpen(false)} title="Match details" maxH="68%">
                <div className="pb-2">
                    <p className="text-[12px] font-semibold text-foreground">Your profile</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {["Dryness", "Sensitive", "Barrier support"].map((t) => (
                            <span key={t} className="rounded-full bg-pale px-3 py-1 text-[11.5px] font-medium text-secondary">
                                {t}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 text-[12px] font-semibold text-foreground">Product fit</p>
                    <div className="mt-1.5 space-y-2">
                        {["Moisture sealing", "Barrier support", "Low-irritation routine position"].map((t) => (
                            <div key={t} className="flex items-center gap-2 text-[13px] text-foreground">
                                <Check className="h-4 w-4 text-secondary" strokeWidth={2.2} />
                                {t}
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 rounded-[12px] bg-pale/70 p-3 text-[11.5px] leading-relaxed text-muted-foreground">
                        YAGI skin insights support product discovery and do not replace medical diagnosis.
                    </p>
                </div>
            </BottomSheet>

            {/* Fullscreen image viewer */}
            <AnimatePresence>
                {viewer && (
                    <motion.div
                        className="fixed inset-0 z-[80] flex items-center justify-center bg-[hsl(150_20%_10%/0.92)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewer(false)}
                    >
                        <button
                            aria-label="Close image viewer"
                            className="glass-control absolute right-5 top-12 grid h-10 w-10 place-items-center rounded-full"
                            onClick={() => setViewer(false)}
                        >
                            <X className="h-5 w-5 text-primary" strokeWidth={2} />
                        </button>
                        <img
                            src={product.images[activeImg]}
                            alt={product.name}
                            className="max-h-[80%] max-w-[90%] rounded-3xl object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </MobileShell>
    );
}
