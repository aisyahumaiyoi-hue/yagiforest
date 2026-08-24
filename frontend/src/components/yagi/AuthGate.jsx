import { useState } from "react";
import { Lock, Leaf } from "lucide-react";
import { BottomSheet } from "@/components/yagi/BottomSheet";
import { useYagi } from "@/store/YagiContext";

export const AuthGate = ({ open, onClose, onSuccess, title = "Save your order securely" }) => {
    const { login, register } = useYagi();
    const [mode, setMode] = useState("signin"); // signin | create
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
            onSuccess?.();
        } catch (e) {
            setError(e.message || "We couldn\u2019t sign you in yet. Your checkout is still saved.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <BottomSheet open={open} onClose={onClose} maxH="82%">
            <div className="pb-3">
                <div className="flex flex-col items-center text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-[hsl(96_58%_90%)] to-[hsl(116_44%_74%)]">
                        <Lock className="h-6 w-6 text-primary" strokeWidth={1.9} />
                    </span>
                    <h3 className="font-serif-display mt-3 text-[21px] text-foreground">{title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                        Sign in before payment so we can keep your order, delivery updates and YAGI Points together.
                    </p>
                </div>

                <div className="segmented mt-4 flex gap-1 rounded-[14px] p-1">
                    {[
                        { k: "signin", l: "Sign in" },
                        { k: "create", l: "Create account" },
                    ].map((t) => (
                        <button
                            key={t.k}
                            onClick={() => setMode(t.k)}
                            className={`focus-ring flex-1 rounded-[11px] py-2 text-[12.5px] font-medium ${
                                mode === t.k ? "segmented-active" : "text-muted-foreground"
                            }`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    {mode === "create" && (
                        <label className="block">
                            <span className="mb-1 block text-[12px] font-medium text-foreground">Name</span>
                            <span className="checkout-field flex items-center rounded-[13px] px-3.5 py-3">
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full bg-transparent text-[14px] outline-none"
                                />
                            </span>
                        </label>
                    )}
                    <label className="block">
                        <span className="mb-1 block text-[12px] font-medium text-foreground">Email address</span>
                        <span className="checkout-field flex items-center rounded-[13px] px-3.5 py-3">
                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="w-full bg-transparent text-[14px] outline-none"
                            />
                        </span>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-[12px] font-medium text-foreground">Password</span>
                        <span className="checkout-field flex items-center rounded-[13px] px-3.5 py-3">
                            <input
                                type="password"
                                autoComplete={mode === "create" ? "new-password" : "current-password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                className="w-full bg-transparent text-[14px] outline-none"
                            />
                        </span>
                    </label>

                    {error && <p className="text-[12px] font-medium text-[hsl(4_72%_50%)]">{error}</p>}

                    <button
                        onClick={submit}
                        disabled={busy || !email || password.length < 6}
                        className="btn-green focus-ring w-full rounded-[15px] py-3.5 text-[14px] font-semibold disabled:opacity-60"
                    >
                        {busy ? "Please wait\u2026" : mode === "create" ? "Create account & continue" : "Sign in & continue"}
                    </button>
                    <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                        <Leaf className="h-3 w-3 text-secondary" strokeWidth={2} /> Your checkout details will stay here.
                    </p>
                </div>
            </div>
        </BottomSheet>
    );
};
