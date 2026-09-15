import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, Lock, Check, Truck, Zap, Building2, ChevronRight, Leaf, Users, MapPin,
} from "lucide-react";
import { Wordmark } from "@/components/yagi/Wordmark";
import { AuthGate } from "@/components/yagi/AuthGate";
import { useYagi } from "@/store/YagiContext";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import { api } from "@/lib/api";

const STEPS = ["Contact", "Delivery", "Payment", "Review"];
const SHIPPING_FALLBACK = [
    { id: "regular", name: "Regular delivery", eta: "Arrives in 2–4 days", price: 18000 },
    { id: "express", name: "Express delivery", eta: "Arrives in 1 day", price: 31000 },
];
const SHIPPING_ICONS = { regular: Truck, express: Zap };

const Field = ({ label, helper, error, value, onChange, ...props }) => (
    <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-foreground">{label}</span>
        <span className={`checkout-field flex items-center rounded-[13px] px-3.5 py-3 ${error ? "ring-2 ring-[hsl(4_72%_60%)]" : ""}`}>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={error ? "true" : undefined}
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
                {...props}
            />
        </span>
        {error ? (
            <span className="mt-1 block text-[11px] font-medium text-[hsl(4_72%_50%)]">{error}</span>
        ) : (
            helper && <span className="mt-1 block text-[11px] text-muted-foreground">{helper}</span>
        )}
    </label>
);

export default function Checkout() {
    const navigate = useNavigate();
    const { cartDetailed, cartSubtotal, isCustomer, placeOrder, shipping: shippingOptions } = useYagi();

    const [step, setStep] = useState(0);
    const [shipping, setShipping] = useState("regular");
    const [authOpen, setAuthOpen] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [errors, setErrors] = useState({});
    const [reward, setReward] = useState(null);
    const [rewardOptions, setRewardOptions] = useState([]);
    const [quote, setQuote] = useState(null);

    const shippingList = (shippingOptions && shippingOptions.length ? shippingOptions : SHIPPING_FALLBACK)
        .map((s) => ({ ...s, Icon: SHIPPING_ICONS[s.id] || Truck }));
    const [form, setForm] = useState({
        email: "", phone: "", full_name: "", address: "", city: "", province: "", postal_code: "",
    });
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

    const shipCost = shippingList.find((s) => s.id === shipping)?.price || 0;
    const total = quote?.total ?? cartSubtotal + shipCost;
    useEffect(() => {
        if (isCustomer) api.rewards().then((r) => setRewardOptions(r.items || [])).catch(() => {});
    }, [isCustomer]);

    useEffect(() => {
        if (!cartDetailed.length) return;
        api.quote(shipping, reward?.id).then(setQuote).catch(() => setQuote(null));
    }, [shipping, reward, cartDetailed.length]);

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digits = (v) => (v || "").replace(/\D/g, "");

    const validateStep0 = () => {
        const e = {};
        if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
        if (digits(form.phone).length < 8) e.phone = "Enter a reachable phone number.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep1 = () => {
        const e = {};
        if (!form.full_name.trim()) e.full_name = "Enter the recipient\u2019s full name.";
        if (!form.address.trim()) e.address = "Enter the street address.";
        if (!form.city.trim()) e.city = "Enter the city.";
        if (!form.province.trim()) e.province = "Enter the province.";
        if (!form.postal_code.trim()) e.postal_code = "Enter the postal code.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const goPayment = () => {
        // Contact and delivery must be real before an account is created, so the
        // customer's details carry through auth instead of being replaced later.
        if (!validateStep0()) return;
        if (!isCustomer) {
            setAuthOpen(true);
            return;
        }
        setStep(2);
    };

    const next = () => {
        if (step === 0) {
            if (!validateStep0()) return;
            setStep(1);
            return;
        }
        if (step === 1) {
            if (!validateStep1()) return;
            goPayment();
            return;
        }
        setStep((s) => Math.min(3, s + 1));
    };

    const doPlaceOrder = async () => {
        if (placing) return; // guard against double submit
        if (!validateStep0() || !validateStep1()) {
            setStep(0);
            toast("Please complete your delivery details");
            return;
        }
        setPlacing(true);
        try {
            // Real contact data only. No placeholder identity is ever substituted.
            await placeOrder({
                email: form.email.trim(),
                phone: form.phone.trim(),
                full_name: form.full_name.trim(),
                address: form.address.trim(),
                city: form.city.trim(),
                province: form.province.trim(),
                postal_code: form.postal_code.trim(),
                shipping_method: shipping,
                reward_id: reward?.id || undefined,
            });
            navigate("/checkout/success");
        } catch (e) {
            toast("Order couldn\u2019t be placed", { description: e.message });
            setPlacing(false);
        }
    };

    return (
        <div className="device-frame">
            <div className="scroll-area">
                <header
                    className="sticky top-0 z-20 flex items-center gap-2 px-4 pb-3"
                    style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
                >
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(46_40%_98%/0.95)] to-[hsl(46_40%_98%/0)] backdrop-blur-[6px]" />
                    <button
                        aria-label="Go back"
                        onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
                        className="glass-control focus-ring grid h-10 w-10 place-items-center rounded-[14px]"
                    >
                        <ChevronLeft className="h-5 w-5 text-primary" strokeWidth={2} />
                    </button>
                    <div className="flex flex-1 flex-col items-center">
                        <Wordmark className="text-[20px]" />
                        <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                            <Lock className="h-3 w-3" strokeWidth={2} /> Secure checkout
                        </span>
                    </div>
                    <span className="w-10" />
                </header>

                {/* Progress */}
                <div className="px-5 pb-2">
                    <div className="flex items-center">
                        {STEPS.map((label, i) => (
                            <div key={label} className="flex flex-1 items-center last:flex-none">
                                <div className="flex flex-col items-center">
                                    <span
                                        className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ${
                                            i <= step
                                                ? "bg-gradient-to-br from-[hsl(96_58%_86%)] to-[hsl(116_44%_70%)] text-primary"
                                                : "bg-pale/70 text-muted-foreground"
                                        }`}
                                    >
                                        {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : i + 1}
                                    </span>
                                    <span className={`mt-1 text-[9.5px] ${i <= step ? "font-semibold text-secondary" : "text-muted-foreground"}`}>
                                        {label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <span className={`mx-1 mb-4 h-[2px] flex-1 rounded ${i < step ? "bg-[hsl(116_40%_70%)]" : "bg-border"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-4 pb-44">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-3"
                        >
                            {step === 0 && (
                                <>
                                    <div className="glass-shell rounded-[20px]">
                                        <div className="inner-card flex items-center justify-between rounded-[16px] p-3.5">
                                            <div>
                                                <p className="text-[13px] font-semibold text-foreground">Continue as guest</p>
                                                <p className="text-[11px] text-muted-foreground">Browse freely &mdash; you&rsquo;ll sign in before payment.</p>
                                            </div>
                                            <Check className="h-5 w-5 text-secondary" strokeWidth={2.4} />
                                        </div>
                                    </div>
                                    <div className="glass-shell rounded-[22px]">
                                        <div className="inner-card flex flex-col gap-3 rounded-[18px] p-4">
                                            <p className="text-[13.5px] font-semibold text-foreground">Contact</p>
                                            <Field
                                                label="Email address" type="email" autoComplete="email"
                                                placeholder="you@email.com" value={form.email} onChange={set("email")}
                                                error={errors.email}
                                            />
                                            <Field
                                                label="Phone number" type="tel" autoComplete="tel"
                                                placeholder="+62 …" helper="Used only for delivery updates"
                                                value={form.phone} onChange={set("phone")} error={errors.phone}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 1 && (
                                <>
                                    <div className="glass-shell rounded-[22px]">
                                        <div className="inner-card flex flex-col gap-3 rounded-[18px] p-4">
                                            <p className="text-[13.5px] font-semibold text-foreground">Shipping address</p>
                                            <Field label="Full name" autoComplete="name" placeholder="Full name"
                                                   value={form.full_name} onChange={set("full_name")} error={errors.full_name} />
                                            <Field label="Address" autoComplete="street-address" placeholder="Street address"
                                                   value={form.address} onChange={set("address")} error={errors.address} />
                                            <Field label="City" autoComplete="address-level2" placeholder="City"
                                                   value={form.city} onChange={set("city")} error={errors.city} />
                                            <Field label="Province" autoComplete="address-level1" placeholder="Province"
                                                   value={form.province} onChange={set("province")} error={errors.province} />
                                            <Field label="Postal code" autoComplete="postal-code" placeholder="Postal code"
                                                   value={form.postal_code} onChange={set("postal_code")} error={errors.postal_code} />
                                        </div>
                                    </div>

                                    <p className="mt-1 text-[13.5px] font-semibold text-foreground">Delivery method</p>
                                    {shippingList.map(({ id, Icon, name, eta, price }) => {
                                        const active = shipping === id;
                                        return (
                                            <button key={id} onClick={() => setShipping(id)} className="glass-shell focus-ring rounded-[18px] text-left">
                                                <div className={`inner-card flex items-center gap-3 rounded-[14px] p-3.5 ${active ? "ring-2 ring-[hsl(120_45%_58%)]" : ""}`}>
                                                    <Icon className="h-[19px] w-[19px] text-secondary" strokeWidth={1.9} />
                                                    <div className="flex-1">
                                                        <p className="text-[13px] font-semibold text-foreground">{name}</p>
                                                        <p className="text-[11px] text-muted-foreground">{eta}</p>
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-primary">{formatIDR(price)}</span>
                                                    {active && <Check className="h-4 w-4 text-secondary" strokeWidth={2.4} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <p className="text-[13.5px] font-semibold text-foreground">Payment method</p>
                                    <div className="glass-shell rounded-[18px]">
                                        <div className="inner-card flex items-center gap-3 rounded-[14px] p-3.5 ring-2 ring-[hsl(120_45%_58%)]">
                                            <Building2 className="h-[19px] w-[19px] text-secondary" strokeWidth={1.9} />
                                            <div className="flex-1">
                                                <p className="text-[13.5px] font-semibold text-foreground">Bank transfer</p>
                                                <p className="text-[11px] text-muted-foreground">Manual transfer to YAGI’s account</p>
                                            </div>
                                            <Check className="h-[18px] w-[18px] text-secondary" strokeWidth={2.4} />
                                        </div>
                                    </div>
                                    {rewardOptions.length > 0 && <div className="glass-shell rounded-[18px]"><div className="inner-card rounded-[14px] p-3.5"><p className="text-[13px] font-semibold">Apply a redeemed reward</p><select value={reward?.id || ""} onChange={(e) => setReward(rewardOptions.find((r) => r.id === e.target.value) || null)} className="mt-2 w-full rounded-[11px] border border-border bg-white/70 px-3 py-2 text-[12px]"><option value="">No reward</option>{rewardOptions.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.points_cost} points</option>)}</select><p className="mt-1 text-[10.5px] text-muted-foreground">Only rewards already redeemed to your account can be applied.</p></div></div>}
                                    <div className="glass-shell rounded-[18px]">
                                        <div className="impact-glass rounded-[14px] p-4 text-[12.5px] leading-relaxed text-muted-foreground">
                                            After you place the order we&rsquo;ll show YAGI&rsquo;s bank account and your
                                            order number. Your order is <span className="font-medium text-foreground">created</span>{" "}
                                            right away and marked <span className="font-medium text-foreground">awaiting transfer</span>.
                                            It is only <span className="font-medium text-foreground">confirmed as paid</span> once
                                            our team verifies your transfer.
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    {[
                                        { title: "Delivery address", value: `${form.full_name || "—"} · ${form.address || "—"}, ${form.city || "—"}` },
                                        { title: "Delivery method", value: shippingList.find((s) => s.id === shipping)?.name },
                                        { title: "Payment method", value: "Bank transfer" },
                                    ].map((row, idx) => (
                                        <div key={row.title} className="glass-shell rounded-[18px]">
                                            <div className="inner-card flex items-center justify-between rounded-[14px] p-3.5">
                                                <div>
                                                    <p className="text-[11px] text-muted-foreground">{row.title}</p>
                                                    <p className="text-[13px] font-medium text-foreground">{row.value}</p>
                                                </div>
                                                <button onClick={() => setStep(idx === 2 ? 2 : idx === 1 ? 1 : 1)} className="text-[12px] font-medium text-secondary">Edit</button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="glass-shell rounded-[20px]">
                                        <div className="inner-card rounded-[16px] p-4">
                                            {cartDetailed.map((i) => (
                                                <div key={i.productId + i.variantId} className="flex justify-between py-1 text-[12.5px]">
                                                    <span className="text-muted-foreground">{i.qty}× {i.product.shortName}</span>
                                                    <span className="font-medium text-foreground">{formatIDR(i.lineTotal)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between py-1 text-[12.5px]">
                                                 <span className="text-muted-foreground">Shipping</span>
                                                <span className="font-medium text-foreground">{formatIDR(shipCost)}</span>
                                             </div>
                                             {!!(quote?.discount) && <div className="flex justify-between py-1 text-[12.5px] text-secondary"><span>Reward</span><span>-{formatIDR(quote.discount)}</span></div>}
                                            <div className="mt-2 flex justify-between border-t border-border/60 pt-2.5">
                                                <span className="text-[14px] font-semibold text-foreground">Order total</span>
                                                <span className="text-[16px] font-semibold text-primary">{formatIDR(total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-shell rounded-[20px]">
                                        <div className="impact-glass rounded-[16px] p-4">
                                            <p className="text-[13px] font-semibold text-foreground">The impact you’re supporting</p>
                                            <div className="mt-3 grid grid-cols-3 gap-2">
                                                {[{ Icon: Leaf, t: "Less plastic" }, { Icon: Users, t: "Local producers" }, { Icon: MapPin, t: "Aceh sourcing" }].map(({ Icon, t }) => (
                                                    <div key={t} className="inner-card rounded-[12px] p-2.5">
                                                        <Icon className="h-4 w-4 text-secondary" strokeWidth={1.9} />
                                                        <p className="mt-1 text-[10px] font-medium leading-tight text-foreground">{t}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div
                className="sticky-purchase-bar absolute inset-x-0 bottom-0 z-30 px-4 pt-3"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
            >
                <button
                    onClick={step < 3 ? next : doPlaceOrder}
                    disabled={placing}
                    className="btn-green focus-ring w-full rounded-[16px] py-3.5 text-[15px] font-semibold disabled:opacity-70"
                >
                    {step === 1 && !isCustomer
                        ? "Continue to payment"
                        : step < 3
                        ? "Continue"
                        : placing
                        ? "Placing your order…"
                        : `Place order · ${formatIDR(total)}`}
                </button>
                <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" strokeWidth={2} /> Payment by bank transfer</span>
                    <span>Verified by our team</span>
                </div>
            </div>

            <AuthGate open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); setStep(2); }} />
        </div>
    );
}
