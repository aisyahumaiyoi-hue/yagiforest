import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Plus, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useYagi } from "@/store/YagiContext";
import { formatIDR } from "@/lib/format";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { toggleSaved, isSaved, addToCart } = useYagi();
    const saved = isSaved(product.id);
    const [added, setAdded] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleAdd = async (e) => {
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        try {
            await addToCart(product.id, product.variants?.[0]?.id, 1);
            setAdded(true);
            setTimeout(() => setAdded(false), 900);
        } catch (err) {
            toast("Couldn\u2019t add to bag", { description: err.message });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/product/${product.slug}`)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.slug}`)}
            className="glass-shell focus-ring flex flex-col rounded-[22px] text-left transition-transform active:scale-[0.99]"
        >
            <div className="inner-card flex h-full flex-col overflow-hidden rounded-[18px]">
                <div className="relative aspect-square overflow-hidden bg-pale/50">
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    <button
                        aria-label={saved ? "Remove from saved" : "Save product"}
                        aria-pressed={saved}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSaved(product.id);
                        }}
                        className="heart-chip focus-ring absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full"
                    >
                        <Heart
                            className={`h-[15px] w-[15px] transition-colors ${
                                saved ? "fill-[hsl(4_72%_60%)] text-[hsl(4_72%_60%)]" : "text-secondary"
                            }`}
                            strokeWidth={1.9}
                        />
                    </button>
                </div>

                <div className="flex flex-1 flex-col p-2.5">
                    <p className="line-clamp-2 min-h-[34px] text-[12.5px] font-medium leading-tight text-foreground">
                        {product.name}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-2">
                        <span className="whitespace-nowrap text-[12px] font-semibold text-primary">
                            {formatIDR(product.price)}
                        </span>
                        <button
                            aria-label={`Add ${product.name} to bag`}
                            onClick={handleAdd}
                            disabled={busy}
                            className="product-add focus-ring grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[11px] disabled:opacity-60"
                        >
                            {added ? (
                                <Check className="h-[17px] w-[17px]" strokeWidth={2.4} />
                            ) : (
                                <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * "Shop care" grid. The previous heading claimed "Recommended for you", which
 * implied personalisation YAGI does not perform yet, so the neutral heading is
 * used until Phase 2 introduces real recommendations.
 */
export const ProductGrid = ({ products: productOverride }) => {
    const navigate = useNavigate();
    const { products: catalog, catalogLoaded } = useYagi();
    const products = productOverride || catalog;

    if (catalogLoaded && products.length === 0) {
        return (
            <section>
                <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="font-serif-display text-[19px] text-foreground">Shop care</h3>
                </div>
                <div className="glass-shell rounded-[22px]">
                    <div className="inner-card rounded-[18px] px-5 py-8 text-center">
                        <p className="text-[12.5px] text-muted-foreground">
                            No products are available right now.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="font-serif-display text-[19px] text-foreground">{productOverride ? "For your care profile" : "Shop care"}</h3>
                <button
                    onClick={() => navigate("/shop")}
                    className="focus-ring flex items-center gap-0.5 rounded-md text-[12px] font-medium text-secondary"
                >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
                {products.slice(0, 3).map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    );
};
