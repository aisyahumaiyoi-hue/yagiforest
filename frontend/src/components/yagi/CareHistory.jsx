import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export function CareHistory() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    useEffect(() => { api.careCheckins().then((result) => { setData(result); if (result.eligibility?.eligible) api.event("care_checkin_prompt_viewed", { source: "home" }).catch(() => {}); }).catch(() => setData({ items: [], summary: null })); }, []);
    if (!data) return null;
    return <section className="glass-shell rounded-[22px]"><div className="inner-card rounded-[18px] p-4">
        <div className="flex items-center justify-between"><div><p className="text-[13.5px] font-semibold">Care check-ins</p><p className="mt-0.5 text-[11px] text-muted-foreground">{data.summary?.count_this_month || 0} this month{data.summary?.most_recent ? ` · Most recent: ${data.summary.most_recent}` : ""}</p></div><button onClick={() => navigate("/care-checkin")} className="text-[11px] font-semibold text-secondary">Check in <ArrowRight className="inline h-3 w-3" /></button></div>
        {data.items?.length ? <div className="mt-3 divide-y divide-border/50">{data.items.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between py-2 text-[12px]"><span className="text-muted-foreground">{item.check_in_date}</span><span className="font-medium text-foreground">{item.overall_feeling_label}</span></div>)}</div> : <p className="mt-3 text-[12px] text-muted-foreground">Tell YAGI how care has been feeling. It takes less than a minute.</p>}
    </div></section>;
}
