import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Heart, Sparkles, Leaf, Users, Package, Lock, ChevronDown, ShoppingBag } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { ShopProductCard } from "@/components/yagi/ShopProductCard";
import { useYagi } from "@/store/YagiContext";
import { formatIDR } from "@/lib/format";

export default function Cart() {
    const navigate = useNavigate();
    const { cartDetailed, cartSubtotal, updateQty, removeFromCart, toggleSaved, products, shipping } = useYagi();
    const [promoOpen, setPromoOpen] = useState(false);

    const delivery = (shipping || []).find((s) => s.id === "regular")?.price ?? 18000;
    const total = cartSubtotal ? cartSubtotal + delivery : 0;
    const recs = products.filter((p) => !cartDetailed.some((c) => c.productId === p.id)).slice(0, 2);

    if (cartDetailed.length === 0) {
        return (
            <MobileShell nav={false}>
                <TopBar title="Your bag" />
                <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-pale">
                        <ShoppingBag className="h-9 w-9 text-secondary" strokeWidth={1.6} />
                    </span>
                    <h2 className="font-serif-display mt-5 text-[22px] text-foreground">Your bag is waiting.</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Discover care made for sensitive skin.</p>
                    <button
                        onClick={() => navigate("/shop")}
                        className="btn-green focus-ring mt-5 rounded-[15px] px-6 py-3 text-[14px] font-semibold"
                    >
                        Explore care
                    </button>
                </div>
            </MobileShell>
        );
    }

    return (
        <MobileShell
            nav={false}
            footer={
                <div
                    className="sticky-purchase-bar absolute inset-x-0 bottom-0 z-30 px-4 pt-3"
                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
                >
                    <button
                        onClick={() => navigate("/checkout")}
                        className="btn-green focus-ring w-full rounded-[16px] py-3.5 text-[15px] font-semibold"
                    >
                        Checkout · {formatIDR(total)}
                    </button>
                    <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                        <Lock className="h-3 w-3" strokeWidth={2} /> Secure checkout
                    </p>
                </div>
            }
        >
            <TopBar title="Your bag" subtitle={`${cartDetailed.length} items`} />

            <div className="flex flex-col gap-3 px-4 pt-1 pb-44">
                {/* Items */}
                {cartDetailed.map((item) => (
                    <div key={item.productId + item.variantId} className="glass-shell rounded-[22px]">
                        <div className="inner-card flex gap-3 rounded-[18px] p-3">
                            <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-pale/50">
                                <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-semibold text-foreground">{item.product.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{item.variant?.label}</p>
                                    </div>
                                    <button
                                        aria-label="Save for later"
                                        onClick={() => toggleSaved(item.productId)}
                                        className="shrink-0 text-secondary"
                                    >
                                        <Heart className="h-[17px] w-[17px]" strokeWidth={1.9} />
                                    </button>
                                </div>
                                {item.product.matchScore >= 88 && (
                                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-secondary">
                                        <Sparkles className="h-3 w-3" strokeWidth={2} /> Part of your recommended routine
                                    </p>
                                )}
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    <span className="text-[13.5px] font-semibold text-primary">{formatIDR(item.price)}</span>
                                    <div className="quantity-control flex items-center gap-1 rounded-[12px] px-1 py-1">
                                        <button
                                            aria-label="Decrease"
                                            onClick={() => updateQty(item.productId, item.variantId, -1)}
                                            className="grid h-7 w-7 place-items-center rounded-[9px] text-secondary active:scale-90"
                                        >
                                            <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                                        </button>
                                        <span className="w-5 text-center text-[13px] font-semibold text-foreground">{item.qty}</span>
                                        <button
                                            aria-label="Increase"
                                            onClick={() => updateQty(item.productId, item.variantId, 1)}
                                            className="grid h-7 w-7 place-items-center rounded-[9px] text-secondary active:scale-90"
                                        >
                                            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.productId, item.variantId)}
                                    className="mt-1.5 self-start text-[11px] font-medium text-muted-foreground underline underline-offset-2"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Complete your routine */}
                {recs.length > 0 && (
                    <div>
                        <p className="mb-2 mt-1 text-[13.5px] font-semibold text-foreground">Complete your routine</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {recs.map((p) => (
                                <ShopProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Impact preview */}
                <div className="glass-shell rounded-[22px]">
                    <div className="impact-glass rounded-[18px] p-4">
                        <p className="text-[13.5px] font-semibold text-foreground">Your order’s impact</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {[
                                { Icon: Leaf, t: "Lower-waste choices", v: `${cartDetailed.length} items` },
                                { Icon: Users, t: "Responsible sourcing", v: "Supported" },
                                { Icon: Package, t: "Packaging", v: "Refill-ready" },
                            ].map(({ Icon, t, v }) => (
                                <div key={t} className="inner-card rounded-[13px] p-2.5">
                                    <Icon className="h-[17px] w-[17px] text-secondary" strokeWidth={1.9} />
                                    <p className="mt-1.5 text-[11px] font-semibold leading-tight text-foreground">{v}</p>
                                    <p className="text-[9.5px] leading-tight text-muted-foreground">{t}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-[10px] text-muted-foreground">Impact is calculated from your lower-waste items at checkout</p>
                    </div>
                </div>

                {/* Promo */}
                <button
                    onClick={() => setPromoOpen((o) => !o)}
                    className="glass-control focus-ring flex items-center justify-between rounded-[14px] px-4 py-3 text-[13px] font-medium text-secondary"
                >
                    Have a voucher?
                    <ChevronDown className={`h-4 w-4 transition-transform ${promoOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                </button>
                {promoOpen && (
                    <div className="flex gap-2">
                        <input
                            placeholder="Enter voucher code"
                            className="checkout-field flex-1 rounded-[13px] px-3.5 py-2.5 text-[13px] outline-none"
                        />
                        <button className="glass-control rounded-[13px] px-4 text-[13px] font-semibold text-secondary">Apply</button>
                    </div>
                )}

                {/* Summary */}
                <div className="glass-shell rounded-[22px]">
                    <div className="inner-card rounded-[18px] p-4">
                        {[
                            ["Subtotal", formatIDR(cartSubtotal)],
                            ["Delivery", formatIDR(delivery)],
                            ["Discount", "—"],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-1 text-[13px]">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="font-medium text-foreground">{v}</span>
                            </div>
                        ))}
                        <div className="mt-2 flex justify-between border-t border-border/60 pt-2.5">
                            <span className="text-[14px] font-semibold text-foreground">Total</span>
                            <span className="text-[16px] font-semibold text-primary">{formatIDR(total)}</span>
                        </div>
                        <p className="mt-1 text-[10.5px] text-muted-foreground">Taxes included where applicable</p>
                    </div>
                </div>
            </div>
        </MobileShell>
    );
}
