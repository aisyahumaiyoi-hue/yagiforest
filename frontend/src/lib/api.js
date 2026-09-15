const BASE = (process.env.REACT_APP_BACKEND_URL || "") + "/api";
const TOKEN_KEY = "yagi_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = "GET", body, auth = true, headers: extraHeaders } = {}) {
    const headers = { "Content-Type": "application/json", ...(extraHeaders || {}) };
    if (auth) {
        const t = getToken();
        if (t) headers.Authorization = `Bearer ${t}`;
    }
    let res;
    try {
        res = await fetch(BASE + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (e) {
        // Network failure: surface a human message, never a raw exception.
        const err = new Error("We couldn\u2019t reach YAGI just now. Check your connection and try again.");
        err.status = 0;
        throw err;
    }
    if (!res.ok) {
        let detail = "Something went wrong. Please try again.";
        try {
            const j = await res.json();
            if (typeof j.detail === "string") detail = j.detail;
            else if (Array.isArray(j.detail) && j.detail[0]?.msg) detail = j.detail[0].msg;
        } catch (e) { /* keep default */ }
        const err = new Error(detail);
        err.status = res.status;
        throw err;
    }
    if (res.status === 204) return null;
    return res.json();
}

export const api = {
    // identity
    anon: () => request("/auth/anon", { method: "POST", auth: false }),
    me: () => request("/auth/me"),
    register: (body) => request("/auth/register", { method: "POST", body, auth: false }),
    login: (body) => request("/auth/login", { method: "POST", body, auth: false }),
    // catalog / config
    config: () => request("/config", { auth: false }),
    products: (params = "") => request("/products" + params, { auth: false }),
    // cart
    getCart: () => request("/cart"),
    addItem: (product_id, variant_id, qty = 1) =>
        request("/cart/items", { method: "POST", body: { product_id, variant_id, qty } }),
    patchItem: (product_id, variant_id, delta) =>
        request("/cart/items", { method: "PATCH", body: { product_id, variant_id, delta } }),
    removeItem: (product_id, variant_id) =>
        request("/cart/items", { method: "DELETE", body: { product_id, variant_id } }),
    // favorites
    getFavorites: () => request("/favorites"),
    toggleFavorite: (product_id) => request("/favorites/toggle", { method: "POST", body: { product_id } }),
    // routine
    getRoutine: () => request("/routine"),
    putRoutine: (steps) => request("/routine", { method: "PUT", body: { steps } }),
    // checkout / orders
    quote: (shipping_method) => request("/checkout/quote", { method: "POST", body: { shipping_method } }),
    placeOrder: (body) => request("/orders", { method: "POST", body }),
    getOrders: () => request("/orders"),
    getOrder: (n) => request(`/orders/${n}`),
    // loyalty / profile
    loyalty: () => request("/loyalty"),
    getProfile: () => request("/profile"),
    updateProfile: (body) => request("/profile", { method: "PUT", body }),
    // ai
    aiChat: (body) => request("/ai/chat", { method: "POST", body }),
    aiConversations: () => request("/ai/conversations"),
    // ops
    submitProof: (orderNumber, image_data) => request(`/orders/${orderNumber}/proof`, { method: "POST", body: { image_data } }),
    listAddresses: () => request("/addresses"),
    addAddress: (body) => request("/addresses", { method: "POST", body }),
    rewards: () => request("/rewards"),
    redeem: (reward_id) => request("/rewards/redeem", { method: "POST", body: { reward_id } }),
    // superadmin
    saKnowledge: () => request("/superadmin/knowledge"),
    saAddKnowledge: (body) => request("/superadmin/knowledge", { method: "POST", body }),
    saToggleKnowledge: (source_id, status) => request("/superadmin/knowledge", { method: "PATCH", body: { source_id, status } }),
    saOrders: () => request("/superadmin/orders"),
    saApprove: (order_number) => request("/superadmin/orders/approve", { method: "POST", body: { order_number } }),
    saReject: (order_number, reason) => request("/superadmin/orders/reject", { method: "POST", body: { order_number, reason } }),
    saAiTest: (message) => request("/superadmin/ai-test", { method: "POST", body: { message } }),
    saProducts: () => request("/superadmin/products"),
    saCreateProduct: (body) => request("/superadmin/products", { method: "POST", body }),
    saUpdateProduct: (id, body) => request(`/superadmin/products/${id}`, { method: "PUT", body }),
    saDeleteProduct: (id) => request(`/superadmin/products/${id}`, { method: "DELETE" }),
    saUsers: () => request("/superadmin/users"),
    saSetUserRole: (id, role) => request(`/superadmin/users/${id}/role`, { method: "PATCH", body: { role } }),
    // impact
    impact: () => request("/impact"),
    impactMethodology: () => request("/impact/methodology", { auth: false }),
    // wellness
    wellness: () => request("/wellness"),
    // reviews
    createReview: (body) => request("/reviews", { method: "POST", body }),
    productReviews: (product_id) => request(`/reviews/product/${product_id}`, { auth: false }),
    // onboarding & recommendations
    getOnboarding: () => request("/onboarding"),
    saveOnboarding: (body) => request("/onboarding", { method: "PUT", body }),
    recommendations: () => request("/recommendations"),
    routineProposal: () => request("/routine/proposal"),
    activateRoutine: (steps) => request("/routine/activate", { method: "POST", body: { steps } }),
    careCheckins: () => request("/care/checkins"),
    createCareCheckin: (body) => request("/care/checkins", { method: "POST", body }),
    careSummary: () => request("/care/summary"),
    event: (event, properties = {}) => request("/events", { method: "POST", body: { event, properties } }),
    // superadmin analytics / impact / flags / export
    saAnalytics: () => request("/superadmin/analytics"),
    saImpact: () => request("/superadmin/impact"),
    saFlags: () => request("/superadmin/flags"),
    saSetFlags: (flags) => request("/superadmin/flags", { method: "PUT", body: { flags } }),
    saExportOrders: () => request("/superadmin/export/orders"),
};

// Normalize backend product -> shape the UI already expects.
//
// NOTE: there is deliberately no `matchScore` / `matchReasons` here. YAGI has no
// product-matching model, so the UI must never render a percentage fit score.
// Products carry `designedFor` (real metadata) and `reviewStats` (derived from
// published reviews, absent until real reviews exist).
export const normalizeProduct = (p) => ({
    ...p,
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortName: p.short_name || p.shortName || p.name,
    category: p.category,
    skinConcerns: p.skin_concerns || p.skinConcerns || [],
    purpose: p.purpose,
    description: p.description || p.purpose || "",
    price: p.price,
    unit: p.unit,
    unitPrice: p.unit_price || p.unitPrice || "",
    images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []),
    badges: p.badges || [],
    designedFor: p.designed_for || p.designedFor || [],
    ingredients: p.ingredients || [],
    routineStage: p.routine_stage || p.routineStage,
    usage: p.usage,
    certifications: p.certifications || [],
    variants: p.variants || [],
    impact: p.impact,
    active: p.active,
});

/**
 * Real review aggregate for a product, or null when there are no real reviews.
 * Consumers must render an honest empty state (e.g. "New") rather than a rating.
 */
export const reviewStatsFor = (product, statsMap) => {
    const s = (statsMap && statsMap[product?.id]) || product?.review_stats || product?.reviewStats;
    if (!s || !s.has_reviews || !s.review_count) return null;
    return { rating: s.rating, count: s.review_count };
};

// Normalize backend cart -> shape the UI already expects
export const normalizeCart = (c) => ({
    cartDetailed: (c.items || []).map((i) => ({
        productId: i.product_id,
        variantId: i.variant_id,
        qty: i.qty,
        price: i.price,
        lineTotal: i.line_total,
        variant: { id: i.variant_id, label: i.variant_label },
        product: {
            id: i.product.id,
            slug: i.product.slug,
            name: i.product.name,
            shortName: i.product.short_name,
            images: [i.product.image],
            designedFor: i.product.designed_for || [],
        },
    })),
    cartSubtotal: c.subtotal || 0,
    cartCount: c.count || 0,
    droppedItems: c.dropped_items || [],
});

export const normalizeConfig = (cfg) => ({
    ...cfg,
    featureFlags: cfg?.feature_flags || {},
    unavailableFlags: cfg?.unavailable_flags || [],
    timezone: cfg?.timezone || "Asia/Jakarta",
});
