import { WELLNESS_SERIES } from "./data";

// Editorial 7-day line chart in desaturated botanical green (inline SVG).
// `series` is an array of numbers (routine completion %) derived from real activity.
export const WellnessChart = ({ series }) => {
    const W = 158;
    const H = 74;
    const padX = 8;
    const padY = 12;
    const data = series && series.length ? series : WELLNESS_SERIES;
    const min = Math.min(...data) - 4;
    const max = Math.max(...data) + 2;

    const pts = data.map((v, i) => {
        const x = padX + (i * (W - padX * 2)) / (data.length - 1);
        const y = padY + (H - padY * 2) * (1 - (v - min) / (max - min));
        return [x, y];
    });

    // smooth cubic path
    const line = pts.reduce((acc, p, i, arr) => {
        if (i === 0) return `M ${p[0]},${p[1]}`;
        const prev = arr[i - 1];
        const cx = (prev[0] + p[0]) / 2;
        return `${acc} C ${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    }, "");

    const area = `${line} L ${pts[pts.length - 1][0]},${H} L ${pts[0][0]},${H} Z`;
    const last = pts[pts.length - 1];

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[74px] w-full overflow-visible"
            role="img"
            aria-label="7 day skin wellness progress, trending up 12 points"
        >
            <defs>
                <linearGradient id="wellArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(120 45% 55%)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="hsl(120 45% 55%)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#wellArea)" />
            <path
                d={line}
                fill="none"
                stroke="hsl(142 34% 44%)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {pts.map((p, i) => (
                <circle
                    key={i}
                    cx={p[0]}
                    cy={p[1]}
                    r={i === pts.length - 1 ? 3.2 : 1.6}
                    fill={i === pts.length - 1 ? "hsl(120 48% 46%)" : "hsl(142 30% 58%)"}
                    stroke="white"
                    strokeWidth={i === pts.length - 1 ? 1.6 : 0}
                />
            ))}
            <circle cx={last[0]} cy={last[1]} r="7" fill="hsl(120 48% 46%)" opacity="0.14" />
        </svg>
    );
};
