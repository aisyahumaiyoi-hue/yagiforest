import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    ShoppingBag,
    SlidersHorizontal,
    ArrowUpDown,
    Sparkles,
    Check,
    Heart,
    Droplets,
    ShieldCheck,
    Flame,
    Leaf,
    Waves,
    X,
    ChevronRight,
} from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { Wordmark } from "@/components/yagi/Wordmark";
import { ShopProductCard } from "@/components/yagi/ShopProductCard";
import { ImpactCard, AwardProof } from "@/components/yagi/Impact";
import { BottomSheet } from "@/components/yagi/BottomSheet";
import { useYagi } from "@/store/YagiContext";
import { CONCERNS, CATEGORIES } from "@/data/products";
import { toast } from "sonner";

const CONCERN_ICONS = {
    "For you": Sparkles,
    "Eczema care": Leaf,
    Dryness: Droplets,
    "Skin barrier": ShieldCheck,
    Redness: Flame,
    Itching: Waves,
    "Sensitive skin": Heart,
};

const FILTER_GROUPS = [
    { key: "concern", label: "Skin concern", options: ["Eczema care", "Dryness", "Redness", "Sensitive skin", "Itching", "Skin barrier"] },
    { key: "type", label: "Product type", options: ["Cleanser", "Moisturizer", "Balm", "Serum", "Shampoo", "Body care"] },
    { key: "routine", label: "Routine", options: ["Morning", "Evening", "Anytime"] },
    { key: "pref", label: "Preference", options: ["Fragrance free", "Family friendly", "Refillable", "Best seller"] },
];

const SORTS = ["Recommended", "Best selling", "Newest", "Price: low to high", "Price: high to low"];

const matchesType = (p, token) => {
    const s = (p.name + " " + p.purpose + " " + p.category).toLowerCase();
    if (token === "Body care") return p.category === "Body care";
    if (token === "Shampoo") return p.category === "Hair care";
    if (token === "Moisturizer") return p.routineStage === "moisturize";
    if (token === "Serum") return s.includes("serum");
    if (token === "Balm") return s.includes("balm") || s.includes("butter");
    if (token === "Cleanser") return p.routineStage === "cleanse";
    return true;
};

const matchesPref = (p, token) => {
    const map = { Refillable: "Refill available", "Best seller": "Best seller", "Fragrance free": "Fragrance free", "Family friendly": "Family friendly" };
    return (p.badges || []).includes(map[token]);
};

export default function Shop() {
    const navigate = useNavigate();
    const { products, cartCount } = useYagi();

    const [concern, setConcern] = useState("For you");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("Recommended");
    const [filters, setFilters] = useState({ concern: [], type: [], routine: [], pref: [] });
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [whyProduct, setWhyProduct] = useState(null);
    const [draft, setDraft] = useState(filters);

    const activeFilterChips = useMemo(
        () => Object.entries(filters).flatMap(([g, arr]) => arr.map((v) => ({ g, v }))),
        [filters]
    );

    const filtered = useMemo(() => {
        let list = [...products];
        if (concern !== "For you") list = list.filter((p) => p.skinConcerns.includes(concern));
        if (category !== "All") list = list.filter((p) => p.category === category || category === "Bundles" ? p.category === category : p.category === category);
        if (filters.concern.length) list = list.filter((p) => filters.concern.some((c) => p.skinConcerns.includes(c)));
        if (filters.type.length) list = list.filter((p) => filters.type.some((t) => matchesType(p, t)));
        if (filters.pref.length) list = list.filter((p) => filters.pref.some((t) => matchesPref(p, t)));

        if (sort === "Price: low to high") list.sort((a, b) => a.price - b.price);
        else if (sort === "Price: high to low") list.sort((a, b) => b.price - a.price);
        else if (sort === "Best selling") list.sort((a, b) => b.reviewCount - a.reviewCount);
        else if (sort === "Recommended") list.sort((a, b) => b.matchScore - a.matchScore);
        return list;
    }, [products, concern, category, filters, sort]);

    const toggleDraft = (g, v) =>
        setDraft((d) => ({ ...d, [g]: d[g].includes(v) ? d[g].filter((x) => x !== v) : [...d[g], v] }));

    const openFilter = () => {
        setDraft(filters);
        setFilterOpen(true);
    };

    return (
        <MobileShell>
            {/* Header */}
            <header
                className="sticky top-0 z-20 flex items-center gap-2.5 px-4 pb-2.5"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
            >
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(46_40%_98%/0.92)] to-[hsl(46_40%_98%/0)] backdrop-blur-[6px]" />
                <Wordmark className="pr-1" />
                <label className="glass-control flex h-11 flex-1 items-center gap-2 rounded-[17px] px-3.5">
                    <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.9} />
                    <input
                        aria-label="Search products or skin concerns"
                        placeholder="Search products or skin concerns"
                        className="w-full min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/80 outline-none"
                    />
                </label>
                <button
                    aria-label="Cart"
                    onClick={() => navigate("/cart")}
                    className="glass-control focus-ring relative grid h-11 w-11 shrink-0 place-items-center rounded-[16px]"
                >
                    <ShoppingBag className="h-[19px] w-[19px] text-primary" strokeWidth={1.9} />
                    {cartCount > 0 && (
                        <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[hsl(142_36%_38%)] px-1 text-[10px] font-bold text-white">
                            {cartCount}
                        </span>
                    )}
                </button>
            </header>

            <div
                className="flex flex-col gap-3.5 px-4 pt-1"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" }}
            >
                {/* Editorial intro */}
                <div className="pt-1">
                    <h1 className="font-serif-display text-[24px] leading-tight text-foreground">
                        Care made for sensitive skin
                    </h1>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        Find what fits your skin, routine and values.
                    </p>
                </div>

                {/* Personalized recommendation strip */}
                <div className="glass-shell rounded-[24px]">
                    <div className="inner-card flex items-center gap-3 rounded-[20px] p-3.5">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-pale/80">
                            <Sparkles className="h-[21px] w-[21px] text-secondary" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-semibold text-foreground">Recommended for your skin</p>
                            <p className="truncate text-[11.5px] text-muted-foreground">
                                Barrier support · Dryness · Sensitive
                            </p>
                        </div>
                        <button
                            onClick={() => setConcern("Skin barrier")}
                            className="btn-green focus-ring shrink-0 rounded-[13px] px-3 py-2 text-[12px] font-semibold"
                        >
                            See matches
                        </button>
                    </div>
                </div>

                {/* Concern selector */}
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                    {CONCERNS.map((c) => {
                        const Icon = CONCERN_ICONS[c] || Leaf;
                        const active = concern === c;
                        return (
                            <button
                                key={c}
                                onClick={() => setConcern(c)}
                                data-active={active}
                                className="filter-chip focus-ring flex w-[80px] shrink-0 flex-col items-center gap-1.5 rounded-[16px] px-2 py-2.5"
                            >
                                <Icon className={`h-[18px] w-[18px] ${active ? "text-primary" : "text-secondary"}`} strokeWidth={1.9} />
                                <span className="text-center text-[10.5px] font-medium leading-tight">{c}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Category chips */}
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                    {CATEGORIES.map((c) => {
                        const active = category === c;
                        return (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                data-active={active}
                                className="filter-chip focus-ring shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium"
                            >
                                {c}
                            </button>
                        );
                    })}
                </div>

                {/* Utility bar */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={openFilter}
                        className="glass-control focus-ring inline-flex items-center gap-1.5 rounded-[13px] px-3 py-2 text-[12px] font-medium text-secondary"
                    >
                        <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
                        Filter
                    </button>
                    <button
                        onClick={() => setSortOpen(true)}
                        className="glass-control focus-ring inline-flex items-center gap-1.5 rounded-[13px] px-3 py-2 text-[12px] font-medium text-secondary"
                    >
                        <ArrowUpDown className="h-[15px] w-[15px]" strokeWidth={2} />
                        Sort
                    </button>
                    <span className="ml-auto text-[12px] text-muted-foreground">{filtered.length} products</span>
                </div>

                {/* Applied filter chips */}
                {activeFilterChips.length > 0 && (
                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                        {activeFilterChips.map(({ g, v }) => (
                            <button
                                key={g + v}
                                onClick={() => setFilters((f) => ({ ...f, [g]: f[g].filter((x) => x !== v) }))}
                                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pale px-3 py-1.5 text-[11.5px] font-medium text-secondary"
                            >
                                {v}
                                <X className="h-3 w-3" strokeWidth={2.2} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Product grid or empty */}
                {filtered.length === 0 ? (
                    <div className="glass-shell rounded-[24px]">
                        <div className="inner-card rounded-[20px] px-6 py-10 text-center">
                            <h3 className="font-serif-display text-[20px] text-foreground">Nothing matched yet.</h3>
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                                Try removing a filter or explore all YAGI care.
                            </p>
                            <button
                                onClick={() => {
                                    setFilters({ concern: [], type: [], routine: [], pref: [] });
                                    setConcern("For you");
                                    setCategory("All");
                                }}
                                className="btn-green focus-ring mx-auto mt-4 rounded-[14px] px-4 py-2.5 text-[13px] font-semibold"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2.5">
                            {filtered.slice(0, 4).map((p) => (
                                <ShopProductCard key={p.id} product={p} onWhyFits={setWhyProduct} />
                            ))}
                        </div>

                        <ImpactCard onMethodology={() => toast("Impact methodology", { description: "Estimated from refill vs. single-use packaging mass." })} />

                        <div className="grid grid-cols-2 gap-2.5">
                            {filtered.slice(4).map((p) => (
                                <ShopProductCard key={p.id} product={p} onWhyFits={setWhyProduct} />
                            ))}
                        </div>

                        <AwardProof onLearn={() => toast("ASEAN SEDP 2025", { description: "Recognized for impact-led work." })} />
                    </>
                )}
            </div>

            {/* Filter sheet */}
            <BottomSheet
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                title="Filters"
                footer={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDraft({ concern: [], type: [], routine: [], pref: [] })}
                            className="glass-control focus-ring rounded-[14px] px-4 py-3 text-[13px] font-medium text-secondary"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                setFilters(draft);
                                setFilterOpen(false);
                            }}
                            className="btn-green focus-ring flex-1 rounded-[15px] py-3 text-[14px] font-semibold"
                        >
                            Show {filtered.length} products
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-5 pb-2">
                    {FILTER_GROUPS.map((group) => (
                        <div key={group.key}>
                            <p className="mb-2 text-[13px] font-semibold text-foreground">{group.label}</p>
                            <div className="flex flex-wrap gap-2">
                                {group.options.map((opt) => {
                                    const active = draft[group.key].includes(opt);
                                    return (
                                        <button
                                            key={opt}
                                            data-active={active}
                                            onClick={() => toggleDraft(group.key, opt)}
                                            className="filter-chip focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
                                        >
                                            {active && <Check className="h-3.5 w-3.5" strokeWidth={2.4} />}
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </BottomSheet>

            {/* Sort sheet */}
            <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by" maxH="60%">
                <div className="flex flex-col pb-2">
                    {SORTS.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setSort(s);
                                setSortOpen(false);
                            }}
                            className="focus-ring flex items-center justify-between border-b border-border/60 py-3.5 text-[14px] text-foreground last:border-0"
                        >
                            {s}
                            {sort === s && <Check className="h-[18px] w-[18px] text-secondary" strokeWidth={2.4} />}
                        </button>
                    ))}
                </div>
            </BottomSheet>

            {/* Why it fits sheet */}
            <BottomSheet
                open={!!whyProduct}
                onClose={() => setWhyProduct(null)}
                title="Why it fits you"
                maxH="62%"
            >
                {whyProduct && (
                    <div className="pb-2">
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                            Your latest scan shows <span className="font-medium text-foreground">dryness</span> and a{" "}
                            <span className="font-medium text-foreground">weakened barrier</span>. This formula is
                            positioned in your routine as a moisture-sealing step.
                        </p>
                        <div className="mt-4 space-y-2">
                            {whyProduct.matchReasons.map((r) => (
                                <div key={r} className="flex items-center gap-2 text-[13px] text-foreground">
                                    <Check className="h-4 w-4 text-secondary" strokeWidth={2.2} />
                                    {r}
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[11px] text-muted-foreground">
                            YAGI skin insights support product discovery and do not replace medical diagnosis.
                        </p>
                        <button
                            onClick={() => {
                                const slug = whyProduct.slug;
                                setWhyProduct(null);
                                navigate(`/product/${slug}`);
                            }}
                            className="btn-green focus-ring mt-4 inline-flex w-full items-center justify-center gap-1 rounded-[15px] py-3 text-[14px] font-semibold"
                        >
                            View product
                            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                    </div>
                )}
            </BottomSheet>
        </MobileShell>
    );
}
