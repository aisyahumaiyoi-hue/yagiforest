import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PRODUCTS } from "@/data/products";
import { api, getToken, setToken, normalizeCart, normalizeProduct } from "@/lib/api";

const YagiContext = createContext(null);

const DEFAULT_ROUTINE = [
    { id: "r1", order: 1, period: "morning", stage: "Cleanse", productId: "p5", title: "Cleanse", instruction: "Massage for 30\u201360 sec", completed: true },
    { id: "r2", order: 2, period: "morning", stage: "Moisturize", productId: "p1", title: "Moisturize", instruction: "Seal in moisture", completed: true },
    { id: "r3", order: 3, period: "morning", stage: "Protect", productId: "p4", title: "Protect", instruction: "Light layer on dry areas", completed: false },
    { id: "r4", order: 1, period: "evening", stage: "Treat", productId: "p2", title: "Treat", instruction: "Apply 2\u20133 drops", completed: false },
    { id: "r5", order: 2, period: "evening", stage: "Moisturize", productId: "p3", title: "Moisturize", instruction: "Layer on very dry areas", completed: false },
];

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
    const [cartDetailed, setCartDetailed] = useState([]);
    const [cartSubtotal, setCartSubtotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [saved, setSaved] = useState([]);
    const [routine, setRoutineState] = useState(DEFAULT_ROUTINE);
    const [wellness, setWellness] = useState(null);
    const [lastOrder, setLastOrderState] = useState(loadLastOrder);
    const [shipping, setShipping] = useState([]);
    const [config, setConfig] = useState(null);
    const routineInit = useRef(false);

    const applyCart = useCallback((c) => {
        const n = normalizeCart(c);
        setCartDetailed(n.cartDetailed);
        setCartSubtotal(n.cartSubtotal);
        setCartCount(n.cartCount);
    }, []);

    const ensureToken = useCallback(async () => {
        if (!getToken()) {
            const res = await api.anon();
            setToken(res.token);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        try {
            const cfg = await api.config();
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
            if (r.items && r.items.length) setProducts(r.items.map(normalizeProduct));
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
            } else if (!routineInit.current) {
                routineInit.current = true;
                await api.putRoutine(DEFAULT_ROUTINE);
                setRoutineState(DEFAULT_ROUTINE);
            }
        } catch (e) { /* noop */ }
        try {
            const w = await api.wellness();
            setWellness(w);
        } catch (e) { /* noop */ }
    }, [applyCart]);

    useEffect(() => {
        (async () => {
            await ensureToken();
            await refreshAll();
            setReady(true);
        })();
    }, [ensureToken, refreshAll]);

    // ---- cart ----
    const addToCart = useCallback(async (productId, variantId, qty = 1) => {
        applyCart(await api.addItem(productId, variantId, qty));
    }, [applyCart]);
    const updateQty = useCallback(async (productId, variantId, delta) => {
        applyCart(await api.patchItem(productId, variantId, delta));
    }, [applyCart]);
    const removeFromCart = useCallback(async (productId, variantId) => {
        applyCart(await api.removeItem(productId, variantId));
    }, [applyCart]);

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
        setRoutineState(DEFAULT_ROUTINE);
        await ensureToken();
        await refreshAll();
    }, [ensureToken, refreshAll]);

    const setLastOrder = useCallback((order) => {
        setLastOrderState(order);
        try {
            localStorage.setItem("yagi_last_order", JSON.stringify(order));
        } catch { /* noop */ }
    }, []);

    const placeOrder = useCallback(async (details) => {
        const order = await api.placeOrder(details);
        setLastOrder(order);
        applyCart(await api.getCart());
        return order;
    }, [applyCart, setLastOrder]);

    const getProductById = useCallback((id) => products.find((p) => p.id === id), [products]);
    const getProductBySlug = useCallback((slug) => products.find((p) => p.slug === slug), [products]);

    const value = useMemo(() => ({
        ready,
        products,
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
        setRoutine,
        // wellness
        wellness,
        // orders
        lastOrder,
        setLastOrder,
        placeOrder,
        getProductById,
        getProductBySlug,
        // config / shipping
        config,
        shipping,
    }), [ready, products, identityType, user, login, register, logout, cartDetailed, cartSubtotal, cartCount,
         addToCart, updateQty, removeFromCart, saved, toggleSaved, routine, toggleStep, addToRoutine,
         setRoutine, wellness, lastOrder, setLastOrder, placeOrder, getProductById, getProductBySlug, config, shipping]);

    return <YagiContext.Provider value={value}>{children}</YagiContext.Provider>;
};

export const useYagi = () => {
    const ctx = useContext(YagiContext);
    if (!ctx) throw new Error("useYagi must be used within YagiProvider");
    return ctx;
};
