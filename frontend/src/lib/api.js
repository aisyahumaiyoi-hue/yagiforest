const BASE = (process.env.REACT_APP_BACKEND_URL || "") + "/api";
const TOKEN_KEY = "yagi_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const t = getToken();
        if (t) headers.Authorization = `Bearer ${t}`;
    }
    const res = await fetch(BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        let detail = "Something went wrong.";
        try {
            const j = await res.json();
            detail = typeof j.detail === "string" ? j.detail : detail;
        } catch (e) { /* noop */ }
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
            matchScore: i.product.match_score,
        },
    })),
    cartSubtotal: c.subtotal || 0,
    cartCount: c.count || 0,
});
