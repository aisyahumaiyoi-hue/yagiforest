import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PRODUCTS } from "@/data/products";
import { api, getToken, setToken, normalizeCart, normalizeProduct, normalizeConfig } from "@/lib/api";

const YagiContext = createContext(null);

const loadLastOrder = () => {
    try {
        return JSON.parse(localStorage.getItem("yagi_last_order") || "null");
    } catch {
        return null;
    }
};

export const YagiProvider = ({ children }) => {
    const [ready, setReady] = useState(false);
    const [identityType, setIdentityType] = useState("public"); // public | anonymous | customer
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState(PRODUCTS);
    const [reviewStats, setReviewStats] = useState({});
    const [catalogLoaded, setCatalogLoaded] = useState(false);
    const [cartDetailed, setCartDetailed] = useState([]);
    const [cartSubtotal, setCartSubtotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [cartNotice, setCartNotice] = useState(null);
    const [saved, setSaved] = useState([]);
    const [routine, setRoutineState] = useState([]);
    const [wellness, setWellness] = useState(null);
    const [lastOrder, setLastOrderState] = useState(loadLastOrder);
    const [shipping, setShipping] = useState([]);
    const [config, setConfig] = useState(null);
    const [careProfile, setCareProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [careCheckins, setCareCheckins] = useState({ items: [], summary: null, eligibility: null });
    const routineInit = useRef(false);

    /** Feature flags as read from the server. Unknown flags default to off so a
     *  missing config can never accidentally reveal an unfinished capability. */
    const isEnabled = useCallback(
        (key) => Boolean(config?.featureFlags?.[key]),
        [config]
    );

    const applyCart = useCallback((c) => {
        const n = normalizeCart(c);
        setCartDetailed(n.cartDetailed);
        setCartSubtotal(n.cartSubtotal);
        setCartCount(n.cartCount);
        if (n.droppedItems.length) {
            setCartNotice(n.droppedItems);
        }
    }, []);

    const ensureToken = useCallback(async () => {
        if (!getToken()) {
            const res = await api.anon();
            setToken(res.token);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        try {
            const cfg = normalizeConfig(await api.config());
            setConfig(cfg);
            if (cfg.shipping) setShipping(cfg.shipping);
        } catch (e) { /* noop */ }
        try {
            const meRes = await api.me();
            setIdentityType(meRes.identity);
            setUser(meRes.user);
        } catch (e) { /* noop */ }
        try {
            const r = await api.products("?limit=100");
            if (r.items) {
                setProducts(r.items.map(normalizeProduct));
                setReviewStats(r.stats || {});
                setCatalogLoaded(true);
            }
        } catch (e) { /* noop */ }
        try {
            applyCart(await api.getCart());
        } catch (e) { /* noop */ }
        try {
            const f = await api.getFavorites();
            setSaved(f.product_ids || []);
        } catch (e) { /* noop */ }
        try {
            const r = await api.getRoutine();
            if (r.steps && r.steps.length) {
                setRoutineState(r.steps);
            }
        } catch (e) { /* noop */ }
        try {
            const profile = await api.getOnboarding();
            setCareProfile(profile.completed ? profile : null);
            const recs = await api.recommendations();
            setRecommendations((recs.items || []).map((p) => ({ ...normalizeProduct(p), score: p.score, reasons: p.reasons || [] })));
        } catch (e) { /* noop */ }
        try {
            const w = await api.wellness();
            setWellness(w);
        } catch (e) { /* noop */ }
        try { setCareCheckins(await api.careCheckins()); } catch (e) { /* noop */ }
    }, [applyCart]);

    const saveCareProfile = useCallback(async (profile) => {
        const savedProfile = await api.saveOnboarding(profile);
        setCareProfile({ ...savedProfile, completed: true });
        const recs = await api.recommendations();
        setRecommendations((recs.items || []).map((p) => ({ ...normalizeProduct(p), score: p.score, reasons: p.reasons || [] })));
        return savedProfile;
    }, []);

    const activateSuggestedRoutine = useCallback(async (steps) => {
        const result = await api.activateRoutine(steps);
        setRoutineState(result.steps || steps);
        return result;
    }, []);

    const submitCareCheckin = useCallback(async (body) => {
        const result = await api.createCareCheckin(body);
        setCareCheckins((prev) => ({ ...prev, items: [result, ...(prev.items || []).filter((i) => i.check_in_date !== result.check_in_date)], eligibility: { eligible: false, checked_in_today: true } }));
        return result;
    }, []);

    useEffect(() => {
        (async () => {
            await ensureToken();
            await refreshAll();
            setReady(true);
        })();
    }, [ensureToken, refreshAll]);

    // ---- cart ----
    // Errors propagate to the caller so the UI can show a real message instead
    // of silently appearing to have worked.
    const addToCart = useCallback(async (productId, variantId, qty = 1) => {
        applyCart(await api.addItem(productId, variantId, qty));
    }, [applyCart]);
    const updateQty = useCallback(async (productId, variantId, delta) => {
        applyCart(await api.patchItem(productId, variantId, delta));
    }, [applyCart]);
    const removeFromCart = useCallback(async (productId, variantId) => {
        applyCart(await api.removeItem(productId, variantId));
    }, [applyCart]);
    const clearCartNotice = useCallback(() => setCartNotice(null), []);

    // ---- favorites ----
    const toggleSaved = useCallback(async (productId) => {
        // optimistic
        setSaved((prev) => (prev.includes(productId) ? prev.filter((i) => i !== productId) : [...prev, productId]));
        try {
            const r = await api.toggleFavorite(productId);
            setSaved(r.product_ids || []);
        } catch (e) { /* noop */ }
    }, []);

    // ---- routine ----
    const persistRoutine = useCallback((steps) => {
        api.putRoutine(steps).catch(() => {});
    }, []);
    const refreshWellness = useCallback(async () => {
        try {
            const w = await api.wellness();
            setWellness(w);
        } catch (e) { /* noop */ }
    }, []);
    const setRoutine = useCallback((updater) => {
        setRoutineState((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            persistRoutine(next);
            return next;
        });
        refreshWellness();
    }, [persistRoutine, refreshWellness]);
    const toggleStep = useCallback((stepId) => {
        setRoutine((prev) => prev.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)));
    }, [setRoutine]);
    const addToRoutine = useCallback((product, period = "evening") => {
        setRoutine((prev) => {
            if (prev.some((s) => s.productId === product.id && s.period === period)) return prev;
            const order = prev.filter((s) => s.period === period).length + 1;
            const stageMap = { cleanse: "Cleanse", treat: "Treat", moisturize: "Moisturize" };
            return [...prev, {
                id: "r" + Date.now(), order, period, stage: stageMap[product.routineStage] || "Treat",
                productId: product.id, title: stageMap[product.routineStage] || "Treat",
                instruction: product.usage || "Apply as directed", completed: false,
            }];
        });
    }, [setRoutine]);

    const addPurchasedToRoutine = useCallback(async (orderNumber, productId, period) => {
        const result = await api.addPurchasedToRoutine(orderNumber, productId, period);
        setRoutineState(result.steps || []);
        return result;
    }, []);

    // ---- auth ----
    const login = useCallback(async (email, password) => {
        const res = await api.login({ email, password, anon_token: getToken() });
        setToken(res.token);
        await refreshAll();
        return res.user;
    }, [refreshAll]);
    const register = useCallback(async (email, password, display_name) => {
        const res = await api.register({ email, password, display_name, anon_token: getToken() });
        setToken(res.token);
        await refreshAll();
        return res.user;
    }, [refreshAll]);
    const logout = useCallback(async () => {
        setToken(null);
        setUser(null);
        setIdentityType("public");
        routineInit.current = false;
        setRoutineState([]);
        await ensureToken();
        await refreshAll();
    }, [ensureToken, refreshAll]);

    const setLastOrder = useCallback((order) => {
        setLastOrderState(order);
        try {
            localStorage.setItem("yagi_last_order", JSON.stringify(order));
        } catch { /* noop */ }
    }, []);

    // One key per checkout session: re-submitting the same attempt returns the
    // order that already exists instead of creating a second one.
    const orderKeyRef = useRef(null);
    const resetOrderKey = useCallback(() => { orderKeyRef.current = null; }, []);

    const placeOrder = useCallback(async (details) => {
        if (!orderKeyRef.current) {
            orderKeyRef.current =
                (globalThis.crypto?.randomUUID?.() ||
                    `ord_${Date.now()}_${Math.random().toString(36).slice(2)}`);
        }
        const order = await api.placeOrder({ ...details, idempotency_key: orderKeyRef.current });
        orderKeyRef.current = null;
        setLastOrder(order);
        applyCart(await api.getCart());
        return order;
    }, [applyCart, setLastOrder]);

    const getProductById = useCallback((id) => products.find((p) => p.id === id), [products]);
    const getProductBySlug = useCallback((slug) => products.find((p) => p.slug === slug), [products]);

    const value = useMemo(() => ({
        ready,
        products,
        catalogLoaded,
        // identity
        identityType,
        isCustomer: identityType === "customer",
        user,
        login,
        register,
        logout,
        // cart
        cartDetailed,
        cartSubtotal,
        cartCount,
        cartNotice,
        clearCartNotice,
        addToCart,
        updateQty,
        removeFromCart,
        // favorites
        saved,
        toggleSaved,
        isSaved: (id) => saved.includes(id),
        // routine
         routine,
        toggleStep,
         addToRoutine,
         addPurchasedToRoutine,
         setRoutine,
         careProfile,
         recommendations,
         saveCareProfile,
         activateSuggestedRoutine,
         careCheckins,
         submitCareCheckin,
        // wellness
        wellness,
        // reviews
        reviewStats,
        getReviewStats: (product) => reviewStats[product?.id] || null,
        // orders
        lastOrder,
        setLastOrder,
        placeOrder,
        resetOrderKey,
        getProductById,
        getProductBySlug,
        // config / shipping / flags
        config,
        shipping,
        isEnabled,
        timezone: config?.timezone || "Asia/Jakarta",
    }), [ready, products, catalogLoaded, identityType, user, login, register, logout, cartDetailed, cartSubtotal,
         cartCount, cartNotice, clearCartNotice, addToCart, updateQty, removeFromCart, saved, toggleSaved, routine,
           toggleStep, addToRoutine, addPurchasedToRoutine, setRoutine, careProfile, recommendations, saveCareProfile, activateSuggestedRoutine, careCheckins, submitCareCheckin, wellness, reviewStats, lastOrder, setLastOrder, placeOrder,
         resetOrderKey, getProductById, getProductBySlug, config, shipping, isEnabled]);

    return <YagiContext.Provider value={value}>{children}</YagiContext.Provider>;
};

export const useYagi = () => {
    const ctx = useContext(YagiContext);
    if (!ctx) throw new Error("useYagi must be used within YagiProvider");
    return ctx;
};
