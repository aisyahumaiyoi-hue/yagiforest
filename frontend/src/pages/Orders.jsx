import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { formatIDR } from "@/lib/format";

const STATUS_LABEL = { awaiting_transfer: "Awaiting transfer", paid: "Paid", pending: "Pending" };

export default function Orders() {
    const navigate = useNavigate();
    const { isCustomer } = useYagi();
    const [orders, setOrders] = useState(null);

    useEffect(() => {
        if (isCustomer) api.getOrders().then((r) => setOrders(r.items)).catch(() => setOrders([]));
        else setOrders([]);
    }, [isCustomer]);

    return (
        <MobileShell nav={false}>
            <TopBar title="Your orders" />
            <div className="flex flex-col gap-3 px-4 pt-1 pb-24">
                {!isCustomer && (
                    <div className="pt-16 text-center">
                        <p className="text-[13px] text-muted-foreground">Sign in to see your orders.</p>
                        <button onClick={() => navigate("/auth")} className="btn-green focus-ring mt-4 rounded-[14px] px-5 py-2.5 text-[13px] font-semibold">Sign in</button>
                    </div>
                )}
                {isCustomer && orders && orders.length === 0 && (
                    <div className="flex flex-col items-center pt-20 text-center">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-pale"><Package className="h-8 w-8 text-secondary" strokeWidth={1.6} /></span>
                        <p className="mt-4 text-[13px] text-muted-foreground">No orders yet.</p>
                        <button onClick={() => navigate("/shop")} className="btn-green focus-ring mt-4 rounded-[14px] px-5 py-2.5 text-[13px] font-semibold">Explore care</button>
                    </div>
                )}
                {isCustomer && (orders || []).map((o) => (
                    <div key={o.order_number} className="glass-shell rounded-[22px]">
                        <div className="inner-card rounded-[18px] p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground">#{o.order_number}</p>
                                    <p className="text-[10.5px] text-muted-foreground">{new Date(o.placed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {o.shipping_method}</p>
                                </div>
                                <span className="rounded-full bg-pale px-2.5 py-1 text-[10px] font-semibold text-secondary">{STATUS_LABEL[o.payment_status] || o.status}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                {o.items.map((it, i) => (
                                    <div key={i} className="h-12 w-12 overflow-hidden rounded-[10px] bg-pale/50">
                                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                                <span className="text-[11.5px] text-muted-foreground">+{o.points_earned} points · {o.items.length} items</span>
                                <span className="text-[14px] font-semibold text-primary">{formatIDR(o.grand_total)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </MobileShell>
    );
}
