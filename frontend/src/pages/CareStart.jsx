import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CareStart() {
    const navigate = useNavigate();
    const { careProfile, recommendations, routine, activateSuggestedRoutine } = useYagi();
    const [steps, setSteps] = useState([]);
    const [busy, setBusy] = useState(false);
    useEffect(() => { api.routineProposal().then((r) => setSteps(r.steps || [])).catch(() => setSteps([])); }, []);
    const activate = async () => {
        setBusy(true);
        try { await activateSuggestedRoutine(steps); toast("Your routine is ready"); navigate("/routine"); }
        catch (e) { if (e.status === 409) { toast("Your current routine is protected", { description: "Review it before adding suggested steps." }); navigate("/routine"); } else toast("We couldn’t save that yet.", { description: e.message }); }
        finally { setBusy(false); }
    };
    const concernLabels = { dryness: "dryness", sensitive_skin: "sensitive skin", skin_barrier: "skin barrier", redness: "redness", itching: "itching", eczema_care: "eczema care" };
    if (!careProfile) return <MobileShell><div className="p-6"><p className="text-sm text-muted-foreground">Complete your care profile to see a starting point.</p><button onClick={() => navigate("/onboarding?step=0")} className="btn-green mt-5 rounded-xl px-4 py-3 text-sm">Personalize my care</button></div></MobileShell>;
    return <MobileShell><div className="flex min-h-full flex-col px-5" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-pale"><Sparkles className="h-5 w-5 text-secondary" /></div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Your care starting point</p>
        <h1 className="font-serif-display mt-2 text-[30px] leading-tight text-foreground">Built around what you told us.</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">You can change this anytime. Based on your selected {careProfile.concerns.map((c) => concernLabels[c] || c).join(" and ")} concerns.</p>
        <section className="glass-shell mt-6 rounded-[22px]"><div className="inner-card rounded-[18px] p-4"><div className="flex items-center justify-between"><h2 className="font-serif-display text-[20px]">Your starting routine</h2><span className="text-[11px] text-secondary">{careProfile.routine_preference}</span></div>{steps.length ? <div className="mt-4 space-y-2">{steps.map((s) => <div key={s.id} className="flex items-center gap-3 rounded-[13px] bg-pale/50 p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-secondary"><Check className="h-4 w-4" /></span><div><p className="text-[13px] font-semibold">{s.stage}</p><p className="text-[11px] text-muted-foreground">{s.instruction}</p></div></div>)}</div> : <p className="mt-4 text-[12px] text-muted-foreground">No specific match yet. Explore the catalog and build a routine from available products.</p>}</div></section>
        {recommendations.length > 0 && <section className="mt-6"><h2 className="font-serif-display text-[20px]">A few products to explore</h2><div className="mt-3 space-y-2">{recommendations.slice(0, 3).map((p) => <button key={p.id} onClick={() => navigate(`/product/${p.slug}`)} className="glass-control flex w-full items-center gap-3 rounded-[16px] p-3 text-left"><img src={p.images?.[0] || p.image} alt="" className="h-12 w-12 rounded-[11px] object-cover" /><span className="min-w-0 flex-1"><b className="block truncate text-[13px]">{p.name}</b><small className="text-[11px] text-muted-foreground">{p.reasons?.[0]?.label || "Based on product metadata"}</small></span><ArrowRight className="h-4 w-4 text-secondary" /></button>)}</div></section>}
        <div className="mt-auto pt-8"><button disabled={busy || !steps.length || routine.length > 0} onClick={activate} className="btn-green flex w-full items-center justify-center gap-2 rounded-[17px] py-4 text-[14px] font-semibold disabled:opacity-50">{routine.length ? "Routine already active" : busy ? "Saving…" : "Use this routine"}<ArrowRight className="h-4 w-4" /></button><button onClick={() => navigate("/shop")} className="mt-3 w-full py-3 text-[13px] font-semibold text-secondary">Explore products</button></div>
    </div></MobileShell>;
}
