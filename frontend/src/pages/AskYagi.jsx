import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowUp, Plus, ExternalLink, ShieldAlert, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { formatIDR } from "@/lib/format";

const SUGGESTIONS = [
    "Which YAGI product helps support dry skin?",
    "Where should Body Butter go in my routine?",
    "Apa itu skin barrier?",
    "How should I moisturize eczema-prone skin?",
    "What makes this product impactful?",
];

const SourceList = ({ citations }) => {
    const [open, setOpen] = useState(false);
    if (!citations?.length) return null;
    return (
        <div className="mt-2">
            <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary">
                Sources · {citations.length}
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`} strokeWidth={2} />
            </button>
            {open && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                    {citations.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-[10px] bg-pale/60 px-2.5 py-1.5 text-[11px]">
                            <span className="flex-1 truncate text-foreground">{c.title}<span className="text-muted-foreground"> · {c.publisher}</span></span>
                            {c.url && <ExternalLink className="h-3 w-3 text-secondary" strokeWidth={2} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function AskYagi() {
    const navigate = useNavigate();
    const { addToCart } = useYagi();
    const [params] = useSearchParams();
    const productId = params.get("product_id") || null;
    const productName = params.get("product_name") || null;

    const [messages, setMessages] = useState([]); // {role, content, citations, products, safety}
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [convId, setConvId] = useState(null);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

    const send = async (text) => {
        const q = (text ?? input).trim();
        if (!q || busy) return;
        setInput("");
        setMessages((m) => [...m, { role: "user", content: q }]);
        setBusy(true);
        try {
            const res = await api.aiChat({ message: q, conversation_id: convId, product_id: productId, context_type: productId ? "product" : "general" });
            setConvId(res.conversation_id);
            setMessages((m) => [...m, { role: "assistant", content: res.answer, citations: res.citations, products: res.products, safety: res.safety }]);
        } catch (e) {
            setMessages((m) => [...m, { role: "assistant", content: e.message || "Ask YAGI couldn’t answer just now. Please try again.", error: true }]);
        } finally {
            setBusy(false);
        }
    };

    return (
        <MobileShell nav={false}>
            <TopBar title="Ask YAGI" subtitle="Care assistant" />

            <div className="flex flex-col gap-3 px-4 pt-1 pb-40">
                {productName && (
                    <div className="glass-control inline-flex w-fit items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[11.5px] font-medium text-secondary">
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Asking about {productName}
                    </div>
                )}

                {messages.length === 0 && (
                    <div className="pt-4">
                        <div className="glass-shell rounded-[26px]">
                            <div className="inner-card rounded-[22px] p-5 text-center">
                                <span className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-gradient-to-br from-[hsl(96_58%_90%)] to-[hsl(116_44%_74%)]">
                                    <Sparkles className="h-6 w-6 text-primary" strokeWidth={1.9} />
                                </span>
                                <h2 className="font-serif-display mt-3 text-[22px] text-foreground">What can I help with?</h2>
                                <p className="mt-1 text-[12.5px] text-muted-foreground">Ask about YAGI products, your routine or general eczema care.</p>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                            {SUGGESTIONS.map((s) => (
                                <button key={s} onClick={() => send(s)} className="glass-control focus-ring rounded-[14px] px-4 py-3 text-left text-[12.5px] font-medium text-foreground">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "self-end max-w-[85%]" : "self-start w-full"}>
                        {m.role === "user" ? (
                            <div className="rounded-[16px] rounded-br-[6px] bg-gradient-to-br from-[hsl(96_58%_88%)] to-[hsl(112_42%_80%)] px-3.5 py-2.5 text-[13px] text-primary shadow-glass-sm">
                                {m.content}
                            </div>
                        ) : (
                            <div className="glass-shell rounded-[18px]">
                                <div className="inner-card rounded-[14px] p-3.5">
                                    {m.safety?.escalation && (
                                        <div className="mb-2 flex items-start gap-2 rounded-[10px] bg-[hsl(38_70%_94%)] p-2.5">
                                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(30_70%_42%)]" strokeWidth={2} />
                                            <p className="text-[11.5px] leading-snug text-[hsl(28_45%_32%)]">This may need professional medical attention. Please consider contacting a qualified healthcare professional.</p>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{m.content}</p>
                                    {m.products?.length > 0 && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            {m.products.map((p) => (
                                                <div key={p.id} className="flex items-center gap-2.5 rounded-[12px] bg-pale/50 p-2">
                                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-white">
                                                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-[12px] font-semibold text-foreground">{p.name}</p>
                                                        <p className="text-[11px] font-medium text-primary">{formatIDR(p.price)}</p>
                                                    </div>
                                                    <button onClick={() => navigate(`/product/${p.slug}`)} className="rounded-[9px] bg-white px-2 py-1.5 text-[10.5px] font-semibold text-secondary shadow-glass-sm">View</button>
                                                    <button onClick={() => addToCart(p.id, undefined, 1)} aria-label="Add to bag" className="product-add grid h-8 w-8 place-items-center rounded-[10px]">
                                                        <Plus className="h-4 w-4" strokeWidth={2.2} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {!m.error && <SourceList citations={m.citations} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {busy && (
                    <div className="self-start">
                        <div className="glass-control inline-flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
                            <Sparkles className="h-4 w-4 animate-pulse text-secondary" strokeWidth={2} /> YAGI is thinking…
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Sticky input */}
            <div className="sticky-purchase-bar absolute inset-x-0 bottom-0 z-30 px-4 pt-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
                <div className="glass-control flex items-end gap-2 rounded-[18px] p-1.5 pl-3.5">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        rows={1}
                        placeholder="Ask YAGI anything..."
                        className="max-h-24 w-full resize-none bg-transparent py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 outline-none"
                    />
                    <button onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send" className="btn-bubble grid h-10 w-10 shrink-0 place-items-center rounded-[13px] disabled:opacity-50">
                        <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
                    </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">Ask YAGI provides general care information, not medical diagnosis.</p>
            </div>
        </MobileShell>
    );
}
