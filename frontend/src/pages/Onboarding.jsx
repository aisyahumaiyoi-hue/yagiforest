import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Leaf } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CONCERNS = [
    ["dryness", "Dryness"], ["sensitive_skin", "Sensitive skin"],
    ["skin_barrier", "Skin barrier"], ["redness", "Redness-prone skin"],
    ["itching", "Itch / discomfort care"], ["eczema_care", "Eczema care interest"],
];
const FEELS = [["comfortable", "Comfortable"], ["a_little_dry", "A little dry"], ["very_dry", "Very dry"], ["easily_irritated", "Easily irritated"], ["itchy_uncomfortable", "Itchy / uncomfortable"], ["prefer_not_to_say", "Prefer not to say"]];
const PREFERENCES = [["essential", "Essential", "Keep it to the basics."], ["balanced", "Balanced", "A few useful steps."], ["complete", "Complete", "I’m comfortable with a fuller routine."]];

const Choice = ({ selected, label, onClick }) => (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`focus-ring flex min-h-[52px] w-full items-center justify-between rounded-[16px] border px-4 text-left text-[13px] transition-colors ${selected ? "border-[hsl(120_45%_48%)] bg-pale text-primary" : "border-border/70 bg-white/70 text-foreground"}`}>
        <span>{label}</span><span className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-secondary bg-secondary text-white" : "border-muted-foreground/40"}`}>{selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
    </button>
);

export default function Onboarding() {
    const navigate = useNavigate();
    const { careProfile, saveCareProfile, recommendations } = useYagi();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({ concerns: [], current_feel: null, routine_preference: "balanced", existing_routine_categories: [], onboarding_version: 1 });

    useEffect(() => {
        if (careProfile) setProfile((p) => ({ ...p, ...careProfile, concerns: careProfile.concerns || [] }));
        else api.event("care_onboarding_started", { source_screen: "onboarding" }).catch(() => {});
    }, [careProfile]);

    const skip = () => { api.event("care_onboarding_skipped", { source_screen: "onboarding" }).catch(() => {}); try { localStorage.setItem("yagi_onboarding_dismissed", "1"); } catch {} navigate("/"); };
    const complete = async () => {
        if (!profile.concerns.length) return toast("Choose at least one care concern");
        setSaving(true);
        try { await saveCareProfile(profile); navigate("/care-start"); }
        catch (e) { toast("We couldn’t save that yet.", { description: e.message }); }
        finally { setSaving(false); }
    };
    const toggleConcern = (key) => setProfile((p) => ({ ...p, concerns: p.concerns.includes(key) ? p.concerns.filter((x) => x !== key) : [...p.concerns, key] }));
    const headings = ["What would you like help with?", "How does your skin feel lately?", "How simple should your routine be?"];
    return <MobileShell>
        <div className="flex min-h-full flex-col px-5" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 18px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}>
            <header className="flex items-center justify-between"><button aria-label="Back" onClick={() => step ? setStep(step - 1) : navigate("/")} className="glass-control grid h-10 w-10 place-items-center rounded-[14px]"><ArrowLeft className="h-4 w-4" /></button><span className="font-serif-display text-[24px] text-primary">Yagi</span><button onClick={skip} className="glass-control rounded-full px-4 py-2 text-[12px] font-semibold text-secondary">Maybe later</button></header>
            <div className="mt-8 flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Personalize my care</p><h1 className="font-serif-display mt-2 text-[28px] leading-tight text-foreground">{headings[step]}</h1></div><span className="text-[12px] text-muted-foreground">{step + 1} of 3</span></div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">Choose what feels relevant right now. This is self-reported care context, not a diagnosis.</p>
            <div className="mt-6 flex flex-col gap-2.5">{step === 0 && CONCERNS.map(([key, label]) => <Choice key={key} label={label} selected={profile.concerns.includes(key)} onClick={() => toggleConcern(key)} />)}{step === 1 && FEELS.map(([key, label]) => <Choice key={key} label={label} selected={profile.current_feel === key} onClick={() => setProfile((p) => ({ ...p, current_feel: key }))} />)}{step === 2 && PREFERENCES.map(([key, label, desc]) => <button key={key} type="button" aria-pressed={profile.routine_preference === key} onClick={() => setProfile((p) => ({ ...p, routine_preference: key }))} className={`focus-ring rounded-[18px] border p-4 text-left ${profile.routine_preference === key ? "border-[hsl(120_45%_48%)] bg-pale" : "border-border/70 bg-white/70"}`}><span className="flex items-center justify-between text-[14px] font-semibold">{label}<span className={`grid h-5 w-5 place-items-center rounded-full border ${profile.routine_preference === key ? "border-secondary bg-secondary text-white" : "border-muted-foreground/40"}`}>{profile.routine_preference === key && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span></span><span className="mt-1 block text-[12px] text-muted-foreground">{desc}</span></button>)}</div>
            <div className="mt-auto pt-8"><button disabled={saving} onClick={step < 2 ? () => setStep(step + 1) : complete} className="btn-green focus-ring flex w-full items-center justify-center gap-2 rounded-[17px] py-4 text-[14px] font-semibold disabled:opacity-60">{saving ? "Saving…" : step < 2 ? "Continue" : "See my starting point"}<ArrowRight className="h-4 w-4" /></button><div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground"><Leaf className="h-3.5 w-3.5 text-secondary" />You can change this anytime in your care profile.</div></div>
        </div>
    </MobileShell>;
}
