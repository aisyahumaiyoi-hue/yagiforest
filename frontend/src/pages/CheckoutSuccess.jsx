import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Leaf, Users, MapPin, ChevronRight, Copy, Building2 } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { useYagi } from "@/store/YagiContext";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";

export default function CheckoutSuccess() {
    const navigate = useNavigate();
    const { lastOrder, addToRoutine, getProductById } = useYagi();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!lastOrder) navigate("/");
    }, [lastOrder, navigate]);
    if (!lastOrder) return null;

    const bank = lastOrder.bank_account || {};
    const routineProducts = (lastOrder.items || [])
        .map((i) => getProductById(i.product_id))
        .filter(Boolean);

    const copyNumber = () => {
        try {
            navigator.clipboard?.writeText((bank.account_number || "").replace(/\s/g, ""));
        } catch { /* noop */ }
        setCopied(true);
        toast("Account number copied");
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <MobileShell nav={false}>
            <div className="flex flex-col items-center px-5 pt-14 pb-24 text-center">
                <div className="relative grid h-24 w-24 place-items-center">
                    <motion.span
                        className="absolute inset-0 rounded-full bg-[hsl(112_50%_60%/0.2)]"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1.15, opacity: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                        className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[hsl(96_58%_88%)] to-[hsl(116_44%_72%)]"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    >
                        <Check className="h-10 w-10 text-primary" strokeWidth={2.4} />
                    </motion.span>
                </div>

                <h1 className="font-serif-display mt-6 text-[26px] leading-tight text-foreground">
                    Your care is on its way.
                </h1>
                <p className="mt-2 text-[13px] text-muted-foreground">Order #{lastOrder.order_number}</p>
                <p className="text-[13px] text-muted-foreground">Expected {lastOrder.shipping_eta}</p>

                {/* Bank transfer instructions */}
                <div className="glass-shell mt-6 w-full rounded-[24px] text-left">
                    <div className="inner-card rounded-[20px] p-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                            <p className="text-[13.5px] font-semibold text-foreground">Complete your bank transfer</p>
                        </div>
                        <div className="mt-3 rounded-[14px] bg-pale/60 p-3.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-muted-foreground">{bank.bank} · {bank.account_name}</p>
                                    <p className="font-serif-display text-[20px] tracking-wide text-primary">{bank.account_number}</p>
                                </div>
                                <button onClick={copyNumber} className="glass-control focus-ring grid h-10 w-10 place-items-center rounded-[12px]" aria-label="Copy account number">
                                    {copied ? <Check className="h-4 w-4 text-secondary" strokeWidth={2.4} /> : <Copy className="h-4 w-4 text-secondary" strokeWidth={2} />}
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                                <span className="text-[12px] text-muted-foreground">Transfer exactly</span>
                                <span className="text-[16px] font-semibold text-primary">{formatIDR(lastOrder.grand_total)}</span>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                            Your order confirms automatically once we receive your transfer.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex w-full flex-col gap-2.5">
                    <button onClick={() => navigate("/profile/orders")} className="btn-green focus-ring w-full rounded-[16px] py-3.5 text-[15px] font-semibold">
                        Track order
                    </button>
                    <button onClick={() => navigate("/")} className="glass-control focus-ring w-full rounded-[16px] py-3.5 text-[14px] font-medium text-secondary">
                        Back home
                    </button>
                </div>

                {/* Points + impact reveal */}
                <div className="glass-shell mt-7 w-full rounded-[24px] text-left">
                    <div className="impact-glass rounded-[20px] p-4">
                        <p className="text-[13.5px] font-semibold text-foreground">This order is part of something bigger.</p>
                        <div className="mt-2 flex items-center gap-2 rounded-[12px] bg-white/70 p-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[hsl(96_58%_88%)] to-[hsl(116_44%_72%)] text-[13px] font-bold text-primary">+</span>
                            <div className="flex-1">
                                <p className="text-[13px] font-semibold text-foreground">+{lastOrder.points_earned} YAGI Points pending</p>
                                <p className="text-[10.5px] text-muted-foreground">Available after your order is confirmed.</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {[{ Icon: Leaf, t: "Lower-waste" }, { Icon: Users, t: "Responsible sourcing" }, { Icon: MapPin, t: "Local value" }].map(({ Icon, t }) => (
                                <div key={t} className="inner-card rounded-[13px] p-2.5">
                                    <Icon className="h-[17px] w-[17px] text-secondary" strokeWidth={1.9} />
                                    <p className="mt-1.5 text-[10px] font-medium leading-tight text-foreground">{t}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate("/rewards")} className="focus-ring mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-secondary">
                            View my rewards <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Add to routine */}
                {routineProducts.length > 0 && (
                    <div className="mt-4 w-full text-left">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[13.5px] font-semibold text-foreground">Add these to your routine?</p>
                            <button
                                onClick={() => { routineProducts.forEach((p) => addToRoutine(p)); toast("Added to routine"); navigate("/routine"); }}
                                className="text-[12.5px] font-semibold text-secondary"
                            >
                                Add all
                            </button>
                        </div>
                        <div className="flex gap-2.5">
                            {routineProducts.map((p) => (
                                <div key={p.id} className="glass-shell flex-1 rounded-[18px]">
                                    <div className="inner-card overflow-hidden rounded-[14px]">
                                        <div className="h-16 overflow-hidden bg-pale/40">
                                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                        </div>
                                        <p className="p-2 text-[10.5px] font-medium leading-tight text-foreground">{p.shortName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MobileShell>
    );
}
