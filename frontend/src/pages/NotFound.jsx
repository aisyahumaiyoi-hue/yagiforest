import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();
    return <main className="flex min-h-screen items-center justify-center bg-[hsl(46_40%_98%)] px-5 text-center">
        <div className="max-w-sm">
            <p className="text-[11px] font-semibold tracking-[.16em] text-secondary">YAGI</p>
            <h1 className="font-serif-display mt-3 text-[42px] leading-tight text-primary">This page is not available.</h1>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">The link may be outdated or the page may have moved.</p>
            <button onClick={() => navigate("/")} className="btn-green focus-ring mt-7 rounded-[15px] px-5 py-3 text-[13px] font-semibold">Return home</button>
        </div>
    </main>;
}
