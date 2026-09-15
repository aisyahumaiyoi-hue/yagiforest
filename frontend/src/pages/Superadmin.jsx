import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingBag,
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    LogOut,
    Search,
    BarChart3,
    Leaf,
    ToggleRight,
    Download,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";
import { useYagi } from "@/store/YagiContext";
import { api } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";

const EMPTY_PRODUCT = {
    name: "",
    short_name: "",
    slug: "",
    category: "Face care",
    skin_concerns: [],
    purpose: "",
    description: "",
    price: 0,
    unit: "",
    unit_price: "",
    image: "",
    images: [],
    badges: [],
    routine_stage: "",
    usage: "",
    certifications: [],
    designed_for: [],
    lower_waste: false,
    variants: [],
    impact: null,
    active: true,
};

const CONCERN_OPTIONS = ["Dryness", "Skin barrier", "Sensitive skin", "Redness", "Itching", "Eczema care"];
const CATEGORY_OPTIONS = ["Face care", "Body care", "Hair care", "Baby care", "Bundles"];
const ROUTINE_OPTIONS = ["", "cleanse", "treat", "moisturize"];
const ROLE_OPTIONS = ["customer", "admin", "superadmin"];

const NAV = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "impact", label: "Impact", icon: Leaf },
    { key: "products", label: "Products", icon: Package },
    { key: "users", label: "Users", icon: Users },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "knowledge", label: "Knowledge", icon: BookOpen },
    { key: "flags", label: "Feature flags", icon: ToggleRight },
];

function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-slate-600">{label}</span>
            {children}
        </label>
    );
}

const inputCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function Superadmin() {
    const navigate = useNavigate();
    const { user, ready, logout } = useYagi();
    const [tab, setTab] = useState("dashboard");

    // data
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [knowledge, setKnowledge] = useState({ sources: [] });
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [impact, setImpact] = useState(null);
    const [flags, setFlags] = useState(null);
    const [flagRegistry, setFlagRegistry] = useState(null);
    const [unavailableFlags, setUnavailableFlags] = useState([]);

    // product editor
    const [editing, setEditing] = useState(null); // null | "new" | product object
    const [search, setSearch] = useState("");

    const isAdmin = user && (user.role === "superadmin" || user.role === "admin");

    const load = async () => {
        setLoading(true);
        await Promise.all([
            api.saProducts().then((r) => setProducts(r.items)).catch(() => {}),
            api.saUsers().then((r) => setUsers(r.items)).catch(() => {}),
            api.saOrders().then((r) => setOrders(r.items)).catch(() => {}),
            api.saKnowledge().then(setKnowledge).catch(() => {}),
        ]);
        setLoading(false);
    };

    const loadAnalytics = () => api.saAnalytics().then(setAnalytics).catch(() => {});
    const loadImpact = () => api.saImpact().then(setImpact).catch(() => {});
    const loadFlags = () =>
        api.saFlags()
            .then((r) => {
                setFlags(r.flags);
                setFlagRegistry(r.registry || null);
                setUnavailableFlags(r.unavailable || []);
            })
            .catch(() => {});

    useEffect(() => {
        if (isAdmin) load();
    }, [isAdmin]);

    if (ready && !isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h2 className="font-serif text-[22px] text-slate-900">Access denied</h2>
                    <p className="mt-1 text-[13px] text-slate-500">This area is for YAGI staff only.</p>
                    <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white">
                        Back to app
                    </button>
                </div>
            </div>
        );
    }

    // ----- product CRUD handlers -----
    const startNew = () => {
        const base = { ...EMPTY_PRODUCT };
        setEditing({ isNew: true, data: base });
    };
    const startEdit = (p) => setEditing({ isNew: false, data: { ...p } });

    const saveProduct = async () => {
        const d = { ...editing.data };
        if (!d.name || !d.slug) return toast.error("Name and slug are required.");
        d.price = Number(d.price) || 0;
        try {
            if (editing.isNew) {
                await api.saCreateProduct(d);
                toast.success("Product created");
            } else {
                await api.saUpdateProduct(d.id, d);
                toast.success("Product updated");
            }
            setEditing(null);
            await load();
        } catch (e) {
            toast.error(e.message);
        }
    };

    const deleteProduct = async (p) => {
        if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
        await api.saDeleteProduct(p.id);
        toast.success("Product deleted");
        await load();
    };

    const setRole = async (uid, role) => {
        await api.saSetUserRole(uid, role);
        toast.success("Role updated");
        await load();
    };

    const approve = async (n) => { await api.saApprove(n); toast.success("Transfer approved"); await load(); };
    const reject = async (n) => {
        const r = window.prompt("Reason for rejection?") || "Invalid proof";
        await api.saReject(n, r); toast.success("Proof rejected"); await load();
    };

    const exportOrders = async () => {
        try {
            const r = await api.saExportOrders();
            const blob = new Blob([r.content], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = r.filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("CSV exported");
        } catch (e) {
            toast.error(e.message);
        }
    };

    const setFlag = async (key, value) => {
        const next = { ...flags, [key]: value };
        setFlags(next);
        try {
            await api.saSetFlags(next);
            toast.success(`${key} ${value ? "enabled" : "disabled"}`);
        } catch (e) {
            toast.error(e.message);
            loadFlags();
        }
    };

    const filteredProducts = products.filter((p) =>
        (p.name + " " + p.slug + " " + (p.category || "")).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 flex w-60 flex-col border-r border-slate-200 bg-white">
                <div className="flex items-center gap-2 px-5 py-5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-[15px] font-bold text-white">Y</div>
                    <div>
                        <p className="text-[14px] font-bold leading-tight">YAGI Admin</p>
                        <p className="text-[10.5px] text-slate-400">Superadmin console</p>
                    </div>
                </div>
                <nav className="flex flex-1 flex-col gap-1 px-3">
                    {NAV.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                                tab === key ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="border-t border-slate-200 p-3">
                    <button onClick={() => navigate("/")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                        <ChevronLeft className="h-[16px] w-[16px]" strokeWidth={2} /> View app
                    </button>
                    <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                        <LogOut className="h-[16px] w-[16px]" strokeWidth={2} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="ml-60 flex-1 p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-[24px] font-bold">
                            {NAV.find((n) => n.key === tab)?.label}
                        </h1>
                        <p className="text-[13px] text-slate-500">
                            {user?.email} · {user?.role}
                        </p>
                    </div>
                    {tab === "products" && !editing && (
                        <button onClick={startNew} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700">
                            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} /> New product
                        </button>
                    )}
                </div>

                {loading ? (
                    <p className="text-[13px] text-slate-400">Loading…</p>
                ) : tab === "dashboard" ? (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                            { label: "Products", value: products.length },
                            { label: "Users", value: users.length },
                            { label: "Orders", value: orders.length },
                            { label: "Under review", value: orders.filter((o) => o.payment_status === "under_review").length },
                        ].map((s) => (
                            <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-[12px] font-medium text-slate-400">{s.label}</p>
                                <p className="mt-1 font-serif text-[28px] font-bold text-slate-900">{s.value}</p>
                            </div>
                        ))}
                    </div>
                ) : tab === "analytics" ? (
                    <AnalyticsPanel analytics={analytics} onLoad={loadAnalytics} onExport={exportOrders} />
                ) : tab === "impact" ? (
                    <ImpactPanel impact={impact} onLoad={loadImpact} />
                ) : tab === "flags" ? (
                    <FlagsPanel flags={flags} registry={flagRegistry} unavailable={unavailableFlags} onLoad={loadFlags} onToggle={setFlag} />
                ) : tab === "products" ? (
                    editing ? (
                        <ProductEditor editing={editing} setEditing={setEditing} save={saveProduct} />
                    ) : (
                        <div>
                            <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                                <Search className="h-[15px] w-[15px] text-slate-400" strokeWidth={2} />
                                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full bg-transparent py-2.5 text-[13px] outline-none" />
                            </div>
                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                <table className="w-full text-left text-[13px]">
                                    <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Product</th>
                                            <th className="px-4 py-3 font-semibold">Category</th>
                                            <th className="px-4 py-3 font-semibold">Price</th>
                                            <th className="px-4 py-3 font-semibold">Reviews</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/60">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {(p.image || p.images?.[0]) && (
                                                            <img src={p.image || p.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-800">{p.name}</p>
                                                            <p className="text-[11px] text-slate-400">{p.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{p.category}</td>
                                                <td className="px-4 py-3 font-medium">{formatIDR(p.price)}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {p.review_stats?.has_reviews
                                                        ? `${p.review_stats.rating} ★ · ${p.review_stats.review_count}`
                                                        : <span className="text-slate-400">No reviews yet</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.active === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>
                                                        {p.active === false ? "Hidden" : "Active"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => startEdit(p)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                                            <Pencil className="h-[15px] w-[15px]" strokeWidth={2} />
                                                        </button>
                                                        <button onClick={() => deleteProduct(p)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                                                            <Trash2 className="h-[15px] w-[15px]" strokeWidth={2} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No products found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : tab === "users" ? (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <table className="w-full text-left text-[13px]">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">User</th>
                                    <th className="px-4 py-3 font-semibold">Member</th>
                                    <th className="px-4 py-3 font-semibold">Points</th>
                                    <th className="px-4 py-3 font-semibold">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{u.display_name}</p>
                                            <p className="text-[11px] text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{u.member_code}</td>
                                        <td className="px-4 py-3 text-slate-600">{u.points ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.role}
                                                onChange={(e) => setRole(u.id, e.target.value)}
                                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] outline-none focus:border-emerald-500"
                                            >
                                                {ROLE_OPTIONS.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : tab === "orders" ? (
                    <div className="space-y-3">
                        {orders.map((o) => (
                            <div key={o.order_number} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                                <div>
                                    <p className="font-medium text-slate-800">#{o.order_number}</p>
                                    <p className="text-[12px] text-slate-500">{formatIDR(o.grand_total)} · {o.items?.length} items · {o.contact?.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{o.payment_status}</span>
                                    {o.payment_status === "under_review" && (
                                        <>
                                            <button onClick={() => approve(o.order_number)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white">Approve</button>
                                            <button onClick={() => reject(o.order_number)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600">Reject</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="py-10 text-center text-slate-400">No orders yet.</p>}
                    </div>
                ) : tab === "knowledge" ? (
                    <KnowledgePanel knowledge={knowledge} onChanged={load} />
                ) : null}
            </main>
        </div>
    );
}

function ProductEditor({ editing, setEditing, save }) {
    const d = editing.data;
    const set = (k, v) => setEditing({ ...editing, data: { ...d, [k]: v } });

    const toggleConcern = (c) =>
        set("skin_concerns", d.skin_concerns.includes(c) ? d.skin_concerns.filter((x) => x !== c) : [...d.skin_concerns, c]);

    const toggleCert = (c) =>
        set("certifications", d.certifications.includes(c) ? d.certifications.filter((x) => x !== c) : [...d.certifications, c]);

    return (
        <div className="max-w-3xl space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-[15px] font-bold">{editing.isNew ? "New product" : "Edit product"}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Name"><input className={inputCls} value={d.name} onChange={(e) => set("name", e.target.value)} /></Field>
                    <Field label="Short name"><input className={inputCls} value={d.short_name || ""} onChange={(e) => set("short_name", e.target.value)} /></Field>
                    <Field label="Slug"><input className={inputCls} value={d.slug} onChange={(e) => set("slug", e.target.value)} placeholder="my-product-slug" /></Field>
                    <Field label="Category">
                        <select className={inputCls} value={d.category} onChange={(e) => set("category", e.target.value)}>
                            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field label="Price (IDR)"><input type="number" className={inputCls} value={d.price} onChange={(e) => set("price", e.target.value)} /></Field>
                    <Field label="Unit"><input className={inputCls} value={d.unit} onChange={(e) => set("unit", e.target.value)} placeholder="60 g" /></Field>
                    <Field label="Unit price"><input className={inputCls} value={d.unit_price || ""} onChange={(e) => set("unit_price", e.target.value)} placeholder="Rp3.150/g" /></Field>
                    <Field label="Routine stage">
                        <select className={inputCls} value={d.routine_stage || ""} onChange={(e) => set("routine_stage", e.target.value)}>
                            {ROUTINE_OPTIONS.map((r) => <option key={r} value={r}>{r || "—"}</option>)}
                        </select>
                    </Field>
                </div>
                <div className="mt-4 space-y-3">
                    <Field label="Purpose"><input className={inputCls} value={d.purpose} onChange={(e) => set("purpose", e.target.value)} /></Field>
                    <Field label="Description"><textarea rows={3} className={inputCls} value={d.description} onChange={(e) => set("description", e.target.value)} /></Field>
                    <Field label="Usage"><input className={inputCls} value={d.usage} onChange={(e) => set("usage", e.target.value)} /></Field>
                    <Field label="Image URL"><input className={inputCls} value={d.image || ""} onChange={(e) => set("image", e.target.value)} placeholder="https://…" /></Field>
                    <Field label="What it is for (comma separated)">
                        <input
                            className={inputCls}
                            value={(d.designed_for || []).join(", ")}
                            onChange={(e) => set("designed_for", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))}
                            placeholder="Dry skin, Barrier support"
                        />
                    </Field>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-[13px] font-bold">Skin concerns</h3>
                <div className="flex flex-wrap gap-2">
                    {CONCERN_OPTIONS.map((c) => (
                        <button key={c} onClick={() => toggleConcern(c)}
                            className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${d.skin_concerns.includes(c) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <h3 className="mb-3 mt-5 text-[13px] font-bold">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                    {["BPOM", "Halal", "Ecocert"].map((c) => (
                        <button key={c} onClick={() => toggleCert(c)}
                            className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${d.certifications.includes(c) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <label className="mt-5 flex items-center gap-2 text-[13px]">
                    <input type="checkbox" checked={d.active !== false} onChange={(e) => set("active", e.target.checked)} />
                    Active (visible in shop)
                </label>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-[13px] font-bold">Variants</h3>
                <div className="space-y-2">
                    {(d.variants || []).map((v, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input className={inputCls} value={v.id} onChange={(e) => { const nv = [...d.variants]; nv[i] = { ...nv[i], id: e.target.value }; set("variants", nv); }} placeholder="id" />
                            <input className={inputCls} value={v.label} onChange={(e) => { const nv = [...d.variants]; nv[i] = { ...nv[i], label: e.target.value }; set("variants", nv); }} placeholder="label" />
                            <input type="number" className={inputCls} value={v.price} onChange={(e) => { const nv = [...d.variants]; nv[i] = { ...nv[i], price: Number(e.target.value) }; set("variants", nv); }} placeholder="price" />
                            <button onClick={() => set("variants", d.variants.filter((_, x) => x !== i))} className="text-red-500"><Trash2 className="h-[15px] w-[15px]" /></button>
                        </div>
                    ))}
                    <button onClick={() => set("variants", [...(d.variants || []), { id: "", label: "", price: 0 }])}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600">
                        <Plus className="h-[14px] w-[14px]" /> Add variant
                    </button>
                </div>
            </div>

            <div className="flex gap-2 pb-10">
                <button onClick={save} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700">Save product</button>
                <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-medium text-slate-600">Cancel</button>
            </div>
        </div>
    );
}

function KnowledgePanel({ knowledge, onChanged }) {
    const [form, setForm] = useState({ title: "", content: "", publisher: "YAGI Care", trusted_for_health: false, source_url: "" });

    const add = async () => {
        if (!form.title || !form.content) return toast.error("Title and content required.");
        if (form.trusted_for_health && !form.source_url.trim()) {
            return toast.error("Add a source URL before marking this as trusted for health.");
        }
        try {
            await api.saAddKnowledge(form);
            toast.success("Source added");
            setForm({ title: "", content: "", publisher: "YAGI Care", trusted_for_health: false, source_url: "" });
            onChanged();
        } catch (e) {
            toast.error(e.message);
        }
    };

    const toggleStatus = async (s) => {
        try {
            await api.saToggleKnowledge(s.id, s.status === "active" ? "inactive" : "active");
            onChanged();
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="max-w-3xl space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-[13px] font-bold">Add source</h3>
                <p className="mb-3 text-[12px] text-slate-400">
                    Ask YAGI cites these entries. Only mark a source “trusted for health” when it points to a real,
                    citable reference — otherwise it is treated as YAGI-authored care education.
                </p>
                <div className="space-y-3">
                    <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
                    <textarea className={inputCls} rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" />
                    <input className={inputCls} value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder="Publisher" />
                    <input className={inputCls} value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="Source URL (required for health-trusted sources)" />
                    <label className="flex items-center gap-2 text-[13px]">
                        <input type="checkbox" checked={form.trusted_for_health} onChange={(e) => setForm({ ...form, trusted_for_health: e.target.checked })} />
                        Trusted for health (requires a source URL)
                    </label>
                    <button onClick={add} className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white">Save source</button>
                </div>
            </div>
            <div className="space-y-2">
                {knowledge.sources.length === 0 && (
                    <p className="rounded-xl bg-white p-4 text-[12px] text-slate-400 shadow-sm">No sources yet.</p>
                )}
                {knowledge.sources.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">{s.title}</p>
                            <p className="text-[11px] text-slate-400">
                                {s.publisher} · {s.trusted_for_health ? "health-trusted" : "general education"}
                            </p>
                            {s.url ? (
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 underline">
                                    {s.url}
                                </a>
                            ) : (
                                <p className="text-[11px] text-slate-400">No citable URL</p>
                            )}
                        </div>
                        <button
                            onClick={() => toggleStatus(s)}
                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${s.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {s.status}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalyticsPanel({ analytics, onLoad, onExport }) {
    useEffect(() => { onLoad(); }, [onLoad]);

    if (!analytics) return <p className="text-[13px] text-slate-400">Memuat data analitik…</p>;
    const s = analytics.summary;
    const revSeries = (analytics.revenue_series || []).map((d) => ({ date: d.date.slice(5), value: d.value }));
    const funnel = analytics.funnel || {};
    const funnelStages = [
        { label: "Pengguna", value: funnel.users || 0 },
        { label: "Keranjang", value: funnel.carts || 0 },
        { label: "Pesanan", value: funnel.orders || 0 },
        { label: "Menunggu bayar", value: funnel.awaiting_transfer || 0 },
        { label: "Review pembayaran", value: funnel.under_review || 0 },
        { label: "Terbayar", value: funnel.paid || 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-slate-800">Kinerja bisnis</h2>
                <button onClick={onExport} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">
                    <Download className="h-[14px] w-[14px]" strokeWidth={2} /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Total pendapatan", value: formatIDR(s.total_revenue) },
                    { label: "Pendapatan terbayar", value: formatIDR(s.paid_revenue) },
                    { label: "Rata-rata nilai pesanan", value: formatIDR(s.aov) },
                    { label: "Unit terjual", value: s.units_sold },
                    { label: "Total pesanan", value: s.orders },
                    { label: "Pesanan terbayar", value: s.paid_orders },
                    { label: "Pengguna", value: s.users },
                ].map((c) => (
                    <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-[12px] font-medium text-slate-400">{c.label}</p>
                        <p className="mt-1 font-serif text-[22px] font-bold text-slate-900">{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-[13px] font-bold text-slate-800">Pendapatan 30 hari terakhir</p>
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revSeries} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" tickFormatter={(v) => "Rp" + (v / 1000).toFixed(0) + "k"} />
                            <Tooltip formatter={(v) => formatIDR(v)} contentStyle={{ fontSize: 12, borderRadius: 10 }} />
                            <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="mb-3 text-[13px] font-bold text-slate-800">Produk terlaris</p>
                    <table className="w-full text-left text-[12px]">
                        <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                            <tr><th className="py-2 font-semibold">Produk</th><th className="py-2 font-semibold">Unit</th><th className="py-2 text-right font-semibold">Pendapatan</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(analytics.top_products || []).map((p) => (
                                <tr key={p.product_id}>
                                    <td className="py-2 text-slate-700">{p.name}</td>
                                    <td className="py-2 text-slate-500">{p.units}</td>
                                    <td className="py-2 text-right font-medium">{formatIDR(p.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="mb-3 text-[13px] font-bold text-slate-800">Pendapatan per kategori</p>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(analytics.categories || []).map((c) => ({ name: c.category, value: c.revenue }))} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" />
                                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" tickFormatter={(v) => "Rp" + (v / 1000).toFixed(0) + "k"} />
                                <Tooltip formatter={(v) => formatIDR(v)} contentStyle={{ fontSize: 12, borderRadius: 10 }} />
                                <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-[13px] font-bold text-slate-800">Corong konversi</p>
                <div className="flex flex-wrap gap-2">
                    {funnelStages.map((f, i) => (
                        <div key={f.label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">{i + 1}</span>
                            <div>
                                <p className="text-[11px] text-slate-400">{f.label}</p>
                                <p className="text-[15px] font-bold text-slate-800">{f.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ImpactPanel({ impact, onLoad }) {
    useEffect(() => { onLoad(); }, [onLoad]);

    if (!impact) return <p className="text-[13px] text-slate-400">Memuat data dampak…</p>;
    const series = (impact.series?.plastic_grams || []).map((d) => ({ date: d.date.slice(5), value: d.value }));

    return (
        <div className="space-y-6">
            <h2 className="text-[15px] font-bold text-slate-800">Dampak lingkungan & sosial agregat</h2>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Botol plastik dihindari", value: impact.plastic_bottles_avoided },
                    { label: "Plastik dihindari (g)", value: Math.round(impact.plastic_grams_avoided) },
                    { label: "CO₂e dihindari (kg)", value: impact.co2eq_kg_avoided },
                    { label: "Air dihemat (L)", value: impact.water_litres_saved },
                    { label: "Produsen lokal didukung", value: impact.local_producers_supported },
                    { label: "Pesanan berkontribusi", value: impact.orders },
                ].map((c) => (
                    <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-[12px] font-medium text-slate-400">{c.label}</p>
                        <p className="mt-1 font-serif text-[22px] font-bold text-slate-900">{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-[13px] font-bold text-slate-800">Plastik dihindari (30 hari)</p>
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={series} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" />
                            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10 }} />
                            <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-[13px] font-bold text-slate-800">Dampak per produk (unit lower-waste)</p>
                <table className="w-full text-left text-[12px]">
                    <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                        <tr><th className="py-2 font-semibold">Produk</th><th className="py-2 text-right font-semibold">Unit lower-waste</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(impact.by_product || []).map((p) => (
                            <tr key={p.product_id}>
                                <td className="py-2 text-slate-700">{p.name}</td>
                                <td className="py-2 text-right font-medium">{p.lower_waste_units}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-2 text-[13px] font-bold text-slate-800">Metodologi</p>
                <p className="text-[12px] leading-relaxed text-slate-500">{(impact.methodology?.sources || []).join(" ")}</p>
            </div>
        </div>
    );
}

function FlagsPanel({ flags, registry, unavailable, onLoad, onToggle }) {
    useEffect(() => { onLoad(); }, [onLoad]);

    if (!flags) return <p className="text-[13px] text-slate-400">Memuat feature flags…</p>;
    const unavailableSet = new Set(unavailable || []);
    const operational = Object.entries(flags).filter(([k]) => !unavailableSet.has(k));
    const disabled = Object.entries(flags).filter(([k]) => unavailableSet.has(k));

    const Row = ({ flagKey, value, isUnavailable }) => (
        <tr className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
                <p className="font-medium text-slate-700">{registry?.[flagKey]?.label || flagKey}</p>
                <p className="text-[11px] text-slate-400">{flagKey}</p>
                {registry?.[flagKey]?.controls && (
                    <p className="text-[11px] text-slate-400">Controls: {registry[flagKey].controls}</p>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-end">
                    {isUnavailable ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            Not implemented
                        </span>
                    ) : (
                        <button
                            onClick={() => onToggle(flagKey, !value)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-slate-300"}`}
                            aria-label={`Toggle ${flagKey}`}
                            aria-pressed={value}
                        >
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-[15px] font-bold text-slate-800">Operational flags</h2>
                <p className="mt-0.5 text-[12px] text-slate-400">
                    These flags are read by the backend and the app. Toggling one changes real behaviour immediately.
                </p>
                <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
                    <table className="w-full text-left text-[13px]">
                        <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                            <tr><th className="px-4 py-3 font-semibold">Feature</th><th className="px-4 py-3 text-right font-semibold">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {operational.map(([k, v]) => <Row key={k} flagKey={k} value={v} />)}
                        </tbody>
                    </table>
                </div>
            </div>

            {disabled.length > 0 && (
                <div>
                    <h3 className="text-[13px] font-bold text-slate-600">Not available</h3>
                    <p className="mt-0.5 text-[12px] text-slate-400">
                        Listed for transparency only. The capability behind these flags does not exist, so they cannot be
                        switched on.
                    </p>
                    <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
                        <table className="w-full text-left text-[13px]">
                            <tbody className="divide-y divide-slate-100">
                                {disabled.map(([k, v]) => <Row key={k} flagKey={k} value={v} isUnavailable />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
