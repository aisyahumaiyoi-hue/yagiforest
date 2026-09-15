import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { formatBusinessShortDate } from "@/lib/datetime";

/**
 * Payment status wording. "Order created" and "Payment confirmed" are kept
 * strictly separate: an order is never shown as paid before an admin has
 * verified the transfer.
 */
const PAYMENT_LABEL = {
    awaiting_transfer: "Awaiting transfer",
    under_review: "Proof under review",
    paid: "Payment confirmed",
    rejected: "Proof rejected",
};

const TIMELINE = ["Order placed", "Transfer submitted", "Payment confirmed", "Preparing", "Shipped", "Delivered"];
const EVENT_MAP = { order_placed: 0, transfer_submitted: 1, payment_confirmed: 2 };

export default function Orders() {
    const navigate = useNavigate();
    const { isCustomer, ready, addToCart, getProductById } = useYagi();
    const [orders, setOrders] = useState(null);
    const [uploadingFor, setUploadingFor] = useState(null);
    const [routineBusy, setRoutineBusy] = useState(null);
    const [reviewing, setReviewing] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
    const [reorderBusy, setReorderBusy] = useState(null);

    const reload = () =>
        api.getOrders()
            .then((r) => setOrders(r.items))
            .catch((e) => {
                setOrders([]);
                toast("Couldn\u2019t load your orders", { description: e.message });
            });

    useEffect(() => {
        if (isCustomer) reload();
        else if (ready) setOrders([]);
    }, [isCustomer, ready]);

    const uploadProof = (orderNumber) => (e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast("Please choose an image file", { description: "JPG, PNG or WEBP of your transfer receipt." });
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            toast("That image is too large", { description: "Please use a photo under 3 MB." });
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => toast("We couldn\u2019t read that file", { description: "Please try another photo." });
        reader.onload = async () => {
            setUploadingFor(orderNumber);
            try {
                await api.submitProof(orderNumber, reader.result);
                toast("Transfer proof submitted", { description: "Our team will verify it shortly." });
                await reload();
            } catch (err) {
                toast("Upload failed", { description: err.message });
            } finally {
                setUploadingFor(null);
            }
        };
        reader.readAsDataURL(file);
    };

    const addToRoutine = async (orderNumber, productId) => {
        setRoutineBusy(`${orderNumber}:${productId}`);
        try { await api.addPurchasedToRoutine(orderNumber, productId); toast("Added to routine", { description: "Your paid product is now part of your care plan." }); }
        catch (e) { toast("Couldn’t update your routine", { description: e.message }); }
        finally { setRoutineBusy(null); }
    };

    const submitReview = async (orderNumber, productId) => {
        try {
            await api.createReview({ order_number: orderNumber, product_id: productId, rating: Number(reviewForm.rating), title: reviewForm.title.trim() || null, body: reviewForm.body.trim() || null });
            toast("Review submitted", { description: "Thanks for sharing feedback from your purchase." });
            setReviewing(null); setReviewForm({ rating: 5, title: "", body: "" });
        } catch (e) { toast("Couldn’t submit your review", { description: e.message }); }
    };

    const reorder = async (item) => {
        const product = getProductById(item.product_id);
        if (!product) {
            toast("This product is no longer available", { description: "YAGI has not added it to your bag." });
            return;
        }
        const variant = product.variants?.find((v) => v.id === item.variant_id);
        if (!variant) {
            toast("That variant is no longer available", { description: "Choose a current variant from the product page." });
            return;
        }
        setReorderBusy(`${item.product_id}:${item.variant_id}`);
        try { await addToCart(item.product_id, item.variant_id, 1); toast("Added to bag", { description: `Current price: ${formatIDR(variant.price)}` }); }
        catch (e) { toast("Couldn’t start reorder", { description: e.message }); }
        finally { setReorderBusy(null); }
    };

    const loading = isCustomer && orders === null;

    return (
        <MobileShell nav={false}>
            <TopBar title="Your orders" />
            <div className="flex flex-col gap-3 px-4 pt-1 pb-24">
                {!isCustomer && ready && (
                    <div className="pt-16 text-center">
                        <p className="text-[13px] text-muted-foreground">Sign in to see your orders.</p>
                        <button onClick={() => navigate("/auth")} className="btn-green focus-ring mt-4 rounded-[14px] px-5 py-2.5 text-[13px] font-semibold">Sign in</button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col gap-3">
                        {[0, 1].map((i) => (
                            <div key={i} className="glass-shell rounded-[22px]">
                                <div className="inner-card h-[132px] animate-pulse rounded-[18px] bg-pale/40" />
                            </div>
                        ))}
                    </div>
                )}

                {isCustomer && orders && orders.length === 0 && (
                    <div className="flex flex-col items-center pt-20 text-center">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-pale"><Package className="h-8 w-8 text-secondary" strokeWidth={1.6} /></span>
                        <p className="mt-4 text-[13px] text-muted-foreground">No orders yet.</p>
                        <button onClick={() => navigate("/shop")} className="btn-green focus-ring mt-4 rounded-[14px] px-5 py-2.5 text-[13px] font-semibold">Explore care</button>
                    </div>
                )}

                {(orders || []).map((o) => {
                    const placed = formatBusinessShortDate(o.placed_at);
                    const canUpload = ["awaiting_transfer", "rejected"].includes(o.payment_status);
                    const uploading = uploadingFor === o.order_number;
                    let stage = 0;
                    (o.events || []).forEach((ev) => {
                        if (EVENT_MAP[ev.type] != null) stage = Math.max(stage, EVENT_MAP[ev.type]);
                    });
                    if (o.status === "shipped") stage = 4;
                    if (o.status === "delivered") stage = 5;

                    return (
                        <div key={o.order_number} className="glass-shell rounded-[22px]">
                            <div className="inner-card rounded-[18px] p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[13px] font-semibold text-foreground">#{o.order_number}</p>
                                        <p className="text-[10.5px] text-muted-foreground">
                                            {placed} · {o.shipping_method}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-pale px-2.5 py-1 text-[10px] font-semibold text-secondary">
                                        {PAYMENT_LABEL[o.payment_status] || o.payment_status}
                                    </span>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    {o.items.map((it, i) => (
                                        <div key={i} className="h-12 w-12 overflow-hidden rounded-[10px] bg-pale/50">
                                            <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                                    <span className="text-[11.5px] text-muted-foreground">
                                        +{o.points_earned} points pending · {o.items.length} items
                                    </span>
                                    <span className="text-[14px] font-semibold text-primary">{formatIDR(o.grand_total)}</span>
                                </div>

                                {/* Timeline */}
                                <div className="mt-3 flex items-center gap-1" aria-label="Order progress">
                                    {TIMELINE.map((t, i) => (
                                        <div key={t} className="flex flex-1 flex-col items-center gap-1 last:flex-none">
                                            <span className={`h-2 w-2 rounded-full ${i <= stage ? "bg-[hsl(120_48%_46%)]" : "bg-[hsl(140_15%_82%)]"}`} />
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-1.5 text-[10.5px] text-muted-foreground">{TIMELINE[stage]}</p>

                                {canUpload && (
                                    <label className={`btn-green focus-ring mt-3 block cursor-pointer rounded-[12px] py-2.5 text-center text-[12.5px] font-semibold ${uploading ? "opacity-70" : ""}`}>
                                        {uploading ? "Uploading…" : "Upload transfer proof"}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={uploadProof(o.order_number)}
                                        />
                                    </label>
                                )}
                                {o.payment_status === "under_review" && (
                                    <p className="mt-3 rounded-[10px] bg-pale/60 py-2 text-center text-[11.5px] font-medium text-secondary">
                                        Proof submitted · under review
                                    </p>
                                )}
                                {o.payment_status === "paid" && (
                                    <div className="mt-3 space-y-2 rounded-[12px] bg-pale/50 p-3">
                                        <p className="text-[11.5px] font-semibold text-secondary">Payment confirmed · purchased products unlocked</p>
                                        {o.items.map((it) => <div key={it.product_id} className="rounded-[10px] bg-white/60 p-2.5"><div className="flex items-center justify-between gap-2"><span className="text-[11.5px] font-medium">{it.name}</span><span className="text-[10px] text-secondary">Verified purchase</span></div><div className="mt-2 flex flex-wrap gap-2"><button disabled={routineBusy === `${o.order_number}:${it.product_id}`} onClick={() => addToRoutine(o.order_number, it.product_id)} className="flex-1 rounded-[9px] bg-white px-2 py-2 text-[10.5px] font-semibold text-secondary disabled:opacity-50">{routineBusy === `${o.order_number}:${it.product_id}` ? "Saving…" : "Add to routine"}</button><button disabled={reorderBusy === `${it.product_id}:${it.variant_id}`} onClick={() => reorder(it)} className="flex-1 rounded-[9px] bg-white px-2 py-2 text-[10.5px] font-semibold text-secondary disabled:opacity-50">{reorderBusy === `${it.product_id}:${it.variant_id}` ? "Adding…" : "Buy again"}</button><button onClick={() => { setReviewing(`${o.order_number}:${it.product_id}`); setReviewForm({ rating: 5, title: "", body: "" }); }} className="flex-1 rounded-[9px] bg-white px-2 py-2 text-[10.5px] font-semibold text-secondary">Write a review</button></div>{reviewing === `${o.order_number}:${it.product_id}` && <div className="mt-2 space-y-2 border-t border-border/60 pt-2"><select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))} className="w-full rounded-[9px] border border-border bg-white px-2 py-2 text-[11px]"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} maxLength={80} placeholder="Short title (optional)" className="w-full rounded-[9px] border border-border bg-white px-2 py-2 text-[11px]" /><textarea value={reviewForm.body} onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))} maxLength={1000} rows={3} placeholder="What was your experience?" className="w-full resize-none rounded-[9px] border border-border bg-white px-2 py-2 text-[11px]" /><div className="flex gap-2"><button onClick={() => setReviewing(null)} className="flex-1 rounded-[9px] px-2 py-2 text-[10.5px] font-semibold text-muted-foreground">Cancel</button><button onClick={() => submitReview(o.order_number, it.product_id)} className="btn-green flex-1 rounded-[9px] px-2 py-2 text-[10.5px] font-semibold">Submit</button></div></div>}</div>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </MobileShell>
    );
}
