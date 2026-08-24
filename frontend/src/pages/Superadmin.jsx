import { useEffect, useState } from "react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";

export default function Superadmin() {
    const { user, ready } = useYagi();
    const [tab, setTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [knowledge, setKnowledge] = useState({ sources: [] });
    const [form, setForm] = useState({ title: "", content: "", publisher: "YAGI Care", trusted_for_health: true });
    const [testQ, setTestQ] = useState("");
    const [testA, setTestA] = useState(null);

    const isAdmin = user && (user.role === "superadmin" || user.role === "admin");

    const load = () => {
        api.saOrders().then((r) => setOrders(r.items)).catch(() => {});
        api.saKnowledge().then(setKnowledge).catch(() => {});
    };
    useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

    if (ready && !isAdmin) {
        return (
            <MobileShell nav={false}>
                <TopBar title="Superadmin" />
                <div className="px-6 pt-24 text-center">
                    <h2 className="font-serif-display text-[22px] text-foreground">Access denied</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">This area is for YAGI staff only.</p>
                </div>
            </MobileShell>
        );
    }

    const approve = async (n) => { await api.saApprove(n); toast("Transfer approved"); load(); };
    const reject = async (n) => { const r = prompt("Reason for rejection?") || "Invalid proof"; await api.saReject(n, r); toast("Proof rejected"); load(); };
    const addKnowledge = async () => {
        if (!form.title || !form.content) return;
        await api.saAddKnowledge(form); toast("Source added"); setForm({ title: "", content: "", publisher: "YAGI Care", trusted_for_health: true }); load();
    };
    const runTest = async () => { setTestA("…"); try { const r = await api.saAiTest(testQ); setTestA(r.answer); } catch (e) { setTestA(e.message); } };

    return (
        <MobileShell nav={false}>
            <TopBar title="Superadmin" subtitle="Operations" />
            <div className="flex flex-col gap-3 px-4 pt-1 pb-24">
                <div className="segmented flex gap-1 rounded-[14px] p-1">
                    {[["orders", "Orders"], ["knowledge", "Knowledge"], ["test", "Test AI"]].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)} className={`focus-ring flex-1 rounded-[11px] py-2 text-[12px] font-medium ${tab === k ? "segmented-active" : "text-muted-foreground"}`}>{l}</button>
                    ))}
                </div>

                {tab === "orders" && orders.map((o) => (
                    <div key={o.order_number} className="glass-shell rounded-[20px]">
                        <div className="inner-card rounded-[16px] p-3.5">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-foreground">#{o.order_number}</p>
                                <span className="rounded-full bg-pale px-2.5 py-1 text-[10px] font-semibold text-secondary">{o.payment_status}</span>
                            </div>
                            <p className="mt-1 text-[11.5px] text-muted-foreground">{formatIDR(o.grand_total)} · {o.items?.length} items · {o.contact?.email}</p>
                            {o.payment_status === "under_review" && (
                                <div className="mt-2.5 flex gap-2">
                                    <button onClick={() => approve(o.order_number)} className="btn-green focus-ring flex-1 rounded-[12px] py-2 text-[12.5px] font-semibold">Approve transfer</button>
                                    <button onClick={() => reject(o.order_number)} className="glass-control focus-ring rounded-[12px] px-4 py-2 text-[12.5px] font-medium text-secondary">Reject</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {tab === "orders" && orders.length === 0 && <p className="pt-10 text-center text-[13px] text-muted-foreground">No orders yet.</p>}

                {tab === "knowledge" && (
                    <>
                        <div className="glass-shell rounded-[20px]">
                            <div className="inner-card flex flex-col gap-2.5 rounded-[16px] p-4">
                                <p className="text-[13px] font-semibold text-foreground">Add trusted source</p>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="checkout-field rounded-[12px] px-3 py-2.5 text-[13px] outline-none" />
                                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" rows={3} className="checkout-field resize-none rounded-[12px] px-3 py-2.5 text-[13px] outline-none" />
                                <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder="Publisher" className="checkout-field rounded-[12px] px-3 py-2.5 text-[13px] outline-none" />
                                <label className="flex items-center gap-2 text-[12px] text-foreground">
                                    <input type="checkbox" checked={form.trusted_for_health} onChange={(e) => setForm({ ...form, trusted_for_health: e.target.checked })} /> Trusted for health
                                </label>
                                <button onClick={addKnowledge} className="btn-green focus-ring rounded-[12px] py-2.5 text-[13px] font-semibold">Save source</button>
                            </div>
                        </div>
                        {knowledge.sources.map((s) => (
                            <div key={s.id} className="glass-shell rounded-[18px]">
                                <div className="inner-card flex items-center gap-2 rounded-[14px] p-3.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12.5px] font-semibold text-foreground">{s.title}</p>
                                        <p className="text-[10.5px] text-muted-foreground">{s.publisher} · {s.trusted_for_health ? "health" : "info"}</p>
                                    </div>
                                    <button onClick={() => api.saToggleKnowledge(s.id, s.status === "active" ? "inactive" : "active").then(load)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.status === "active" ? "bg-pale text-secondary" : "bg-muted text-muted-foreground"}`}>
                                        {s.status}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {tab === "test" && (
                    <div className="glass-shell rounded-[20px]">
                        <div className="inner-card flex flex-col gap-2.5 rounded-[16px] p-4">
                            <p className="text-[13px] font-semibold text-foreground">Test Ask YAGI</p>
                            <input value={testQ} onChange={(e) => setTestQ(e.target.value)} placeholder="Ask a question using active sources" className="checkout-field rounded-[12px] px-3 py-2.5 text-[13px] outline-none" />
                            <button onClick={runTest} className="btn-green focus-ring rounded-[12px] py-2.5 text-[13px] font-semibold">Run</button>
                            {testA && <p className="whitespace-pre-wrap rounded-[12px] bg-pale/60 p-3 text-[12.5px] leading-relaxed text-foreground">{testA}</p>}
                        </div>
                    </div>
                )}
            </div>
        </MobileShell>
    );
}
