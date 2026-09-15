import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/yagi/MobileShell";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";

const FEELINGS = [
    ["MORE_COMFORTABLE", "More comfortable"],
    ["SAME", "About the same"],
    ["DRIER", "Drier than usual"],
    ["IRRITATED", "More irritated"],
    ["ITCHY_UNCOMFORTABLE", "Itchy / uncomfortable"],
];
const EXPERIENCES = [
    ["EASY", "Easy to follow"],
    ["MANAGEABLE", "Mostly manageable"],
    ["TOO_MANY_STEPS", "Too many steps"],
    ["NOT_RIGHT", "Something didn't feel right"],
];

export default function CareCheckin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { submitCareCheckin } = useYagi();
    const [feeling, setFeeling] = useState("");
    const [experience, setExperience] = useState("");
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => { api.event("care_checkin_started", { source: location.state?.source || "manual" }).catch(() => {}); }, [location.state]);

    const save = async () => {
        if (!feeling || busy) return;
        setBusy(true);
        try {
            const result = await submitCareCheckin({ overall_feeling: feeling, routine_experience: experience || null, optional_note: note, source: location.state?.source || "manual" });
            toast("Check-in saved", { description: result.overall_feeling_label });
            navigate(result.safety?.level && result.safety.level !== "NORMAL" ? "/ask-yagi?context=checkin" : "/routine");
        } catch (e) {
            toast("Couldn't save your check-in", { description: e.message });
        } finally { setBusy(false); }
    };

    return <MobileShell nav={false}>
        <header className="flex items-center gap-3 px-4 pt-5">
            <button onClick={() => navigate(-1)} aria-label="Back" className="glass-control grid h-10 w-10 place-items-center rounded-[14px]"><ArrowLeft className="h-4 w-4" /></button>
            <div><p className="text-[11px] font-medium text-secondary">Care check-in</p><h1 className="font-serif-display text-[23px]">How has your skin been feeling?</h1></div>
        </header>
        <main className="flex flex-col gap-5 px-4 pb-8 pt-6">
            <div className="flex flex-col gap-2">
                {FEELINGS.map(([value, label]) => <button key={value} onClick={() => setFeeling(value)} aria-pressed={feeling === value} className={`glass-control focus-ring rounded-[15px] p-3.5 text-left text-[13px] font-medium ${feeling === value ? "border-primary bg-pale text-primary" : "text-foreground"}`}>{label}</button>)}
            </div>
            <div><p className="mb-2 text-[13px] font-semibold">How did your routine feel? <span className="font-normal text-muted-foreground">Optional</span></p><div className="grid grid-cols-2 gap-2">{EXPERIENCES.map(([value, label]) => <button key={value} onClick={() => setExperience(value)} aria-pressed={experience === value} className={`glass-control rounded-[13px] p-3 text-left text-[11.5px] ${experience === value ? "border-primary bg-pale text-primary" : "text-foreground"}`}>{label}</button>)}</div></div>
            <div><label htmlFor="care-note" className="mb-2 block text-[13px] font-semibold">Anything you want YAGI to know? <span className="font-normal text-muted-foreground">Optional</span></label><textarea id="care-note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="A short note, if useful" className="glass-control w-full resize-none rounded-[14px] p-3 text-[13px] outline-none" /><p className="mt-1 text-right text-[10px] text-muted-foreground">{note.length}/500</p></div>
            <button disabled={!feeling || busy} onClick={save} className="btn-green rounded-[16px] py-3.5 text-[14px] font-semibold disabled:opacity-50">{busy ? "Saving..." : "Save check-in"}</button>
            {(feeling === "DRIER" || feeling === "IRRITATED" || feeling === "ITCHY_UNCOMFORTABLE") && <button onClick={() => navigate("/ask-yagi?context=checkin")} className="glass-control flex items-center justify-center gap-2 rounded-[15px] py-3 text-[13px] font-semibold text-secondary"><MessageCircle className="h-4 w-4" /> Ask YAGI about this</button>}
        </main>
    </MobileShell>;
}
