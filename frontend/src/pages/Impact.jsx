import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Droplets, Recycle, Users, Wind, Award, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";

function StatCard({ Icon, label, value, sub }) {
    return (
        <div className="glass-shell rounded-[20px]">
            <div className="inner-card flex flex-col rounded-[16px] p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-pale/80">
                    <Icon className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                </span>
                <p className="mt-2 font-serif-display text-[22px] leading-none text-foreground">{value}</p>
                <p className="mt-1 text-[11.5px] font-semibold text-foreground">{label}</p>
                {sub && <p className="text-[10px] leading-tight text-muted-foreground">{sub}</p>}
            </div>
        </div>
    );
}

export default function Impact() {
    const navigate = useNavigate();
    const { isCustomer, ready } = useYagi();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isCustomer) {
            setLoading(true);
            api.impact()
                .then(setData)
                .catch(() => setData(null))
                .finally(() => setLoading(false));
        }
    }, [isCustomer]);

    if (ready && !isCustomer) {
        return (
            <MobileShell nav={false}>
                <TopBar title="My Impact" />
                <div className="flex flex-col items-center px-6 pt-24 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-pale"><Leaf className="h-8 w-8 text-secondary" strokeWidth={1.6} /></span>
                    <h2 className="font-serif-display mt-5 text-[22px] text-foreground">Dampak baikmu, terukur.</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Masuk untuk melihat jejak lingkungan dan sosial dari setiap pembelianmu.</p>
                    <button onClick={() => navigate("/auth")} className="btn-green focus-ring mt-5 rounded-[15px] px-6 py-3 text-[14px] font-semibold">Masuk</button>
                </div>
            </MobileShell>
        );
    }

    const hasActivity = (data?.orders ?? 0) > 0;
    const series = (data?.series?.plastic_grams || []).map((d) => ({ date: d.date.slice(5), value: d.value }));
    const equivalents = [
        { Icon: Recycle, label: "Botol plastik dihindari", value: `${data?.plastic_bottles_avoided ?? 0} botol` },
        { Icon: Droplets, label: "Air dihemat", value: `${data?.water_litres_saved ?? 0} L` },
        { Icon: Wind, label: "Emisi CO₂e dihindari", value: `${data?.co2eq_kg_avoided ?? 0} kg` },
        { Icon: Users, label: "Produsen lokal didukung", value: `${data?.local_producers_supported ?? 0} mitra` },
    ];

    return (
        <MobileShell nav={false}>
            <TopBar title="My Impact" />
            <div className="flex flex-col gap-3.5 px-4 pt-1 pb-24">
                <div className="pt-1">
                    <h1 className="font-serif-display text-[24px] leading-tight text-foreground">Dampak baikmu, terukur.</h1>
                    <p className="mt-1 text-[13px] text-muted-foreground">Setiap pilihan lower-waste meninggalkan jejak nyata bagi planet dan komunitas.</p>
                </div>

                {loading && !data && (
                    <div className="glass-shell rounded-[26px]">
                        <div className="impact-glass h-[168px] animate-pulse rounded-[22px]" />
                    </div>
                )}

                {!loading && data && !hasActivity && (
                    <div className="glass-shell rounded-[22px]">
                        <div className="inner-card rounded-[18px] px-5 py-8 text-center">
                            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-pale">
                                <Leaf className="h-7 w-7 text-secondary" strokeWidth={1.7} />
                            </span>
                            <p className="mt-4 text-[13.5px] font-semibold text-foreground">Belum ada dampak tercatat.</p>
                            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                                Angka di halaman ini hanya dihitung dari pesanan yang benar-benar kamu buat. Belanja
                                pilihan lower-waste untuk mulai mengisi jejakmu.
                            </p>
                            <button
                                onClick={() => navigate("/shop")}
                                className="btn-green focus-ring mt-4 rounded-[14px] px-5 py-2.5 text-[13px] font-semibold"
                            >
                                Jelajahi produk
                            </button>
                        </div>
                    </div>
                )}

                {data && hasActivity && (
                    <>
                        <div className="glass-shell rounded-[26px]">
                            <div className="impact-glass rounded-[22px] p-5">
                                <div className="flex items-center justify-between">
                                    <span className="font-serif-display text-[18px] text-primary">Jejak Dampakmu</span>
                                    <Award className="h-5 w-5 text-secondary" strokeWidth={1.8} />
                                </div>
                                <p className="mt-4 text-[11px] text-muted-foreground">Plastik dihindari (total)</p>
                                <p className="font-serif-display text-[40px] leading-none text-primary">{Math.round(data?.plastic_grams_avoided ?? 0)}<span className="text-[20px]"> g</span></p>
                                <p className="mt-1 text-[11.5px] text-secondary">{data.orders} pesanan berkontribusi</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {equivalents.map(({ Icon, label, value }) => (
                                <StatCard key={label} Icon={Icon} label={label} value={value} />
                            ))}
                        </div>

                        <div className="glass-shell rounded-[22px]">
                            <div className="inner-card rounded-[18px] p-4">
                                <p className="text-[13.5px] font-semibold text-foreground">Plastik dihindari (30 hari)</p>
                                <div className="mt-2 h-[160px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={series} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 88%)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(0 0% 45%)" }} stroke="hsl(0 0% 85%)" />
                                            <YAxis tick={{ fontSize: 9, fill: "hsl(0 0% 45%)" }} stroke="hsl(0 0% 85%)" />
                                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                                            <Line type="monotone" dataKey="value" stroke="hsl(142 34% 44%)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-[13.5px] font-semibold text-foreground">Ekuivalensi dampakmu</p>
                            <div className="glass-shell rounded-[18px]">
                                <div className="inner-card divide-y divide-border/60 rounded-[14px] px-4">
                                    {equivalents.map(({ Icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-3 py-3">
                                            <Icon className="h-[18px] w-[18px] text-secondary" strokeWidth={1.9} />
                                            <span className="flex-1 text-[13px] text-foreground">{label}</span>
                                            <span className="text-[13px] font-semibold text-secondary">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Methodology: these figures are estimates from packaging mass,
                    not measured emissions. Stated plainly so the numbers are
                    explainable if a customer asks where they come from. */}
                <div className="glass-shell rounded-[18px]">
                    <div className="inner-card rounded-[14px] p-4">
                        <p className="text-[11px] font-medium tracking-wide text-secondary">Metodologi</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                            Angka di atas adalah <span className="font-medium text-foreground">estimasi</span>, bukan hasil
                            pengukuran langsung. Perhitungan dilakukan dari massa kemasan yang dihindari (rata-rata 28 g
                            per botol), perkiraan jejak karbon plastik cradle-to-gate, dan alokasi dukungan ke jaringan
                            produsen lokal YAGI.
                        </p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                            Hanya pesanan yang tercatat di akunmu yang dihitung di sini.
                        </p>
                    </div>
                </div>
            </div>
        </MobileShell>
    );
}
