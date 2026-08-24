import { useNavigate } from "react-router-dom";
import { Heart, Plus, Sparkles, Leaf, Check } from "lucide-react";
import { useState } from "react";
import { useYagi } from "@/store/YagiContext";
import { formatIDR } from "@/lib/format";
import { Stars } from "./Stars";

export const ShopProductCard = ({ product, onWhyFits }) => {
    const navigate = useNavigate();
    const { toggleSaved, isSaved, addToCart } = useYagi();
    const saved = isSaved(product.id);
    const [added, setAdded] = useState(false);
    const primaryBadge = product.badges?.[0];

    const handleAdd = (e) => {
        e.stopPropagation();
        addToCart(product.id, product.variants?.[0]?.id, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1000);
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
                <div className="relative aspect-[1/1.02] overflow-hidden bg-pale/50">
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    {primaryBadge && (
                        <span className="heart-chip absolute left-2 top-2 rounded-full px-2 py-[3px] text-[9.5px] font-semibold text-secondary">
                            {primaryBadge}
                        </span>
                    )}
                    <button
                        aria-label={saved ? "Remove from saved" : "Save product"}
                        aria-pressed={saved}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSaved(product.id);
                        }}
                        className="heart-chip focus-ring absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full"
                    >
                        <Heart
                            className={`h-[15px] w-[15px] transition-colors ${
                                saved ? "fill-[hsl(4_72%_60%)] text-[hsl(4_72%_60%)]" : "text-secondary"
                            }`}
                            strokeWidth={1.9}
                        />
                    </button>
                    {product.matchScore >= 90 && (
                        <span className="heart-chip absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[9.5px] font-semibold text-secondary">
                            <Sparkles className="h-3 w-3" strokeWidth={2} />
                            {product.matchScore}% match
                        </span>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-3">
                    <p className="text-[13.5px] font-semibold leading-tight text-foreground">{product.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{product.purpose}</p>
                    <div className="mt-1.5">
                        <Stars rating={product.rating} count={product.reviewCount} />
                    </div>

                    {onWhyFits && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onWhyFits(product);
                            }}
                            className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-md text-[10.5px] font-medium text-secondary underline decoration-[hsl(120_40%_70%)] underline-offset-2"
                        >
                            Why it fits you
                        </button>
                    )}

                    <div className="mt-auto pt-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Leaf className="h-3 w-3 text-secondary" strokeWidth={2} />
                            {product.impact?.lowerWaste}
                        </div>
                        <div className="mt-1.5 flex items-end justify-between">
                            <span className="whitespace-nowrap text-[13px] font-semibold text-primary">
                                {formatIDR(product.price)}
                            </span>
                            <button
                                aria-label={`Add ${product.name} to bag`}
                                onClick={handleAdd}
                                className="product-add focus-ring grid h-[34px] w-[34px] place-items-center rounded-[12px]"
                            >
                                {added ? (
                                    <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
                                ) : (
                                    <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
