import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { MobileShell } from "@/components/yagi/MobileShell";
import { TopBar } from "@/components/yagi/TopBar";
import { useYagi } from "@/store/YagiContext";

export default function Auth() {
    const navigate = useNavigate();
    const { login, register, isCustomer } = useYagi();
    const [mode, setMode] = useState("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        setError("");
        setBusy(true);
        try {
            if (mode === "create") await register(email, password, name);
            else await login(email, password);
            navigate("/profile");
        } catch (e) {
            setError(e.message || "We couldn\u2019t sign you in yet.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <MobileShell nav={false}>
            <TopBar showWordmark />
            <div className="flex flex-col px-5 pt-6">
                <div className="text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-[hsl(96_58%_90%)] to-[hsl(116_44%_74%)]">
                        <Leaf className="h-6 w-6 text-primary" strokeWidth={1.9} />
                    </span>
                    <h1 className="font-serif-display mt-3 text-[24px] text-foreground">Make YAGI yours.</h1>
                    <p className="mt-1.5 text-[13px] text-muted-foreground">
                        Save your routine, points, orders and skin progress across devices.
                    </p>
                </div>

                <div className="segmented mt-5 flex gap-1 rounded-[14px] p-1">
                    {[{ k: "signin", l: "Sign in" }, { k: "create", l: "Create account" }].map((t) => (
                        <button key={t.k} onClick={() => setMode(t.k)} className={`focus-ring flex-1 rounded-[11px] py-2 text-[12.5px] font-medium ${mode === t.k ? "segmented-active" : "text-muted-foreground"}`}>
                            {t.l}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    {mode === "create" && (
                        <label className="block">
                            <span className="mb-1 block text-[12px] font-medium text-foreground">Name</span>
                            <span className="checkout-field flex items-center rounded-[13px] px-3.5 py-3">
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-transparent text-[14px] outline-none" />
                            </span>
                        </label>
                    )}
                    <label className="block">
                        <span className="mb-1 block text-[12px] font-medium text-foreground">Email address</span>
                        <span className="checkout-field flex items-center rounded-[13px] px-3.5 py-3">
                            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full bg-transparent text-[14px] outline-none" />
                        </span>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-[12px] font-medium text-foreground">Password</span>
                        <span className="checkout-field flex items-center rounded-[13px] px-3.5 py-3">
                            <input type="password" autoComplete={mode === "create" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full bg-transparent text-[14px] outline-none" />
                        </span>
                    </label>
                    {error && <p className="text-[12px] font-medium text-[hsl(4_72%_50%)]">{error}</p>}
                    {isCustomer && <p className="text-[12px] font-medium text-secondary">You are signed in.</p>}
                    <button onClick={submit} disabled={busy || !email || password.length < 6} className="btn-green focus-ring w-full rounded-[15px] py-3.5 text-[14px] font-semibold disabled:opacity-60">
                        {busy ? "Please wait\u2026" : mode === "create" ? "Create account" : "Sign in"}
                    </button>
                </div>
            </div>
        </MobileShell>
    );
}
