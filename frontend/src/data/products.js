export const IMG = {
    moisturizer:
        "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/87d1377bc3e6763e2767a7c0fbdc3e01bf6720d7fa00f34a9091f0c9c11f97c7.jpeg",
    serum:
        "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/e828293933353fc57b8ef17bd931d6cce7521eea3f51b26dcdaf1e83ef923a4c.jpeg",
    balm:
        "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/b6c3d8ed9e85a44480bec4b723a97637f02824f380b1d9c767b4a5957a498a01.jpeg",
    texture:
        "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/9121aa99cd42be0cf687091910c8dd54e52fd6584e1ee433f3105b131b100aca.jpeg",
    ingredients:
        "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/d33fdf6d5f5129dd945b83c9cb68550b90f5f112711728c2f3777b0ebe60a12b.jpeg",
};

export const HERO_IMAGE =
    "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/1ec996940de04d23616a373cbe6d4b7fe27ec97cf07a29bee7499683095833aa.jpeg";

export const IMPACT_BG =
    "https://static.prod-images.emergentagent.com/jobs/cdf9bc84-3f03-4479-bb9d-15a09cf3bba4/images/4f53d5da2026d671556c67bbae3039877b57c6f6988da7ddef3c71356aefce44.jpeg";

// NOTE: this file is a client-side loading fallback. The server catalog
// (/api/products) is authoritative and overrides these values on load.
export const PRODUCTS = [
    {
        id: "p1",
        slug: "calm-barrier-moisturizer",
        name: "Calm Barrier Moisturizer",
        shortName: "Barrier moisturizer",
        category: "Face care",
        skinConcerns: ["Dryness", "Skin barrier", "Sensitive skin"],
        purpose: "Barrier support for dry, sensitive skin",
        description:
            "A rich yet breathable moisturizer that seals in hydration and helps a compromised barrier feel calmer through the day.",
        price: 189000,
        unit: "60 g",
        unitPrice: "Rp3.150/g",
        images: [IMG.moisturizer, IMG.texture, IMG.ingredients],
        badges: ["Best seller", "For eczema-prone skin"],
        designedFor: ['Dry skin', 'Sensitive skin', 'Barrier support'],
        routineStage: "moisturize",
        usage: "Use after your serum in the evening.",
        certifications: ["BPOM", "Halal", "Ecocert"],
        variants: [
            { id: "30g", label: "30 g", price: 119000 },
            { id: "60g", label: "60 g", price: 189000 },
            { id: "refill", label: "Refill", price: 149000 },
        ],
        ingredients: [
            { name: "Patchouli oil", purpose: "Calms the feel of dry skin", image: IMG.ingredients },
            { name: "Coconut-derived emollients", purpose: "Softens and seals moisture", image: IMG.texture },
            { name: "Botanical oils", purpose: "Supports the skin barrier", image: IMG.ingredients },
        ],
        impact: {
            lowerWaste: "Lower-waste choice",
            plastic: "1 bottle avoided (refill)",
            localSupport: "Supports Aceh growers",
            sourcing: "Traceable sourcing",
            methodology: "Estimated from refill vs. single-use packaging.",
        },
    },
    {
        id: "p2",
        slug: "relief-repair-serum",
        name: "Relief & Repair Serum",
        shortName: "Relief serum",
        category: "Face care",
        skinConcerns: ["Redness", "Itching", "Sensitive skin"],
        purpose: "Soothes redness and the urge to scratch",
        description:
            "A lightweight treatment serum that targets visible redness and helps sensitive skin feel more comfortable.",
        price: 249000,
        unit: "30 ml",
        unitPrice: "Rp8.300/ml",
        images: [IMG.serum, IMG.texture, IMG.ingredients],
        badges: ["For eczema-prone skin"],
        designedFor: ['Redness', 'Itching', 'Sensitive skin'],
        routineStage: "treat",
        usage: "Apply 2\u20133 drops before moisturizer.",
        certifications: ["BPOM", "Halal"],
        variants: [
            { id: "30ml", label: "30 ml", price: 249000 },
            { id: "refill", label: "Refill", price: 199000 },
        ],
        ingredients: [
            { name: "Botanical oils", purpose: "Comforts reactive skin", image: IMG.ingredients },
            { name: "Coconut-derived emollients", purpose: "Cushions the barrier", image: IMG.texture },
        ],
        impact: {
            lowerWaste: "Refill available",
            plastic: "Refill saves 1 bottle",
            localSupport: "Local producer network",
            sourcing: "Responsible sourcing",
            methodology: "Estimated from refill adoption rate.",
        },
    },
    {
        id: "p3",
        slug: "soothing-healing-balm",
        name: "Soothing Healing Balm",
        shortName: "Healing balm",
        category: "Body care",
        skinConcerns: ["Dryness", "Itching", "Eczema care"],
        purpose: "Intensive relief for dry, flare-prone patches",
        description:
            "A concentrated balm for very dry, flare-prone areas. Cushions and protects skin overnight.",
        price: 159000,
        unit: "45 g",
        unitPrice: "Rp3.530/g",
        images: [IMG.balm, IMG.texture, IMG.ingredients],
        badges: ["Best seller", "Refill available"],
        designedFor: ['Dry patches', 'Flare-prone skin', 'Low-irritation care'],
        routineStage: "moisturize",
        usage: "Layer on very dry areas as needed.",
        certifications: ["BPOM", "Halal", "Ecocert"],
        variants: [
            { id: "45g", label: "45 g", price: 159000 },
            { id: "90g", label: "90 g", price: 269000 },
        ],
        ingredients: [
            { name: "Coconut-derived emollients", purpose: "Deeply softens", image: IMG.texture },
            { name: "Botanical oils", purpose: "Protects overnight", image: IMG.ingredients },
        ],
        impact: {
            lowerWaste: "Lower-waste choice",
            plastic: "Recyclable tin",
            localSupport: "Supports local producers",
            sourcing: "Traceable sourcing",
            methodology: "Estimated from packaging material.",
        },
    },
    {
        id: "p4",
        slug: "signature-body-butter",
        name: "YAGI Signature Body Butter",
        shortName: "Body butter",
        category: "Body care",
        skinConcerns: ["Dryness", "Skin barrier", "Sensitive skin"],
        purpose: "Rich moisture for dry, eczema-prone skin",
        description:
            "Our signature whipped body butter. Rich moisture that melts in and seals a dry, sensitive barrier.",
        price: 129000,
        unit: "200 g",
        unitPrice: "Rp645/g",
        images: [IMG.moisturizer, IMG.texture, IMG.ingredients],
        badges: ["Best seller", "Refill available"],
        designedFor: ['Dryness', 'Barrier support', 'Sensitive skin'],
        routineStage: "moisturize",
        usage: "Use after your serum in the evening.",
        certifications: ["BPOM", "Halal", "Ecocert"],
        variants: [
            { id: "30g", label: "30 g", price: 59000 },
            { id: "60g", label: "60 g", price: 89000 },
            { id: "200g", label: "200 g", price: 129000 },
            { id: "refill", label: "Refill", price: 99000 },
        ],
        ingredients: [
            { name: "Patchouli oil", purpose: "Calms the feel of dry skin", image: IMG.ingredients },
            { name: "Coconut-derived emollients", purpose: "Softens and seals moisture", image: IMG.texture },
            { name: "Botanical oils", purpose: "Supports the skin barrier", image: IMG.ingredients },
        ],
        impact: {
            lowerWaste: "Lower-waste choice",
            plastic: "Refill saves 1 bottle",
            localSupport: "Supports Aceh growers",
            sourcing: "Traceable sourcing",
            methodology: "Estimated from refill vs. single-use packaging.",
        },
    },
    {
        id: "p5",
        slug: "gentle-cleansing-bar",
        name: "Gentle Cleansing Bar",
        shortName: "Cleansing bar",
        category: "Face care",
        skinConcerns: ["Sensitive skin", "Skin barrier"],
        purpose: "Soap-free cleansing that respects the barrier",
        description:
            "A soap-free cleansing bar that gently removes the day without stripping a sensitive barrier.",
        price: 89000,
        unit: "90 g",
        unitPrice: "Rp990/g",
        images: [IMG.balm, IMG.texture, IMG.ingredients],
        badges: ["Family friendly"],
        designedFor: ['Sensitive skin', 'Soap-free cleansing', 'Family use'],
        routineStage: "cleanse",
        usage: "Massage for 30\u201360 sec, then rinse.",
        certifications: ["BPOM", "Halal"],
        variants: [{ id: "90g", label: "90 g", price: 89000 }],
        ingredients: [
            { name: "Coconut-derived emollients", purpose: "Cleanses gently", image: IMG.texture },
            { name: "Botanical oils", purpose: "Keeps skin comfortable", image: IMG.ingredients },
        ],
        impact: {
            lowerWaste: "Plastic-free bar",
            plastic: "No bottle needed",
            localSupport: "Supports local producers",
            sourcing: "Responsible sourcing",
            methodology: "Estimated from solid vs. liquid format.",
        },
    },
    {
        id: "p6",
        slug: "scalp-relief-shampoo",
        name: "Scalp Relief Shampoo",
        shortName: "Relief shampoo",
        category: "Hair care",
        skinConcerns: ["Itching", "Sensitive skin"],
        purpose: "Calms an itchy, sensitive scalp",
        description:
            "A mild shampoo formulated to calm an itchy, sensitive scalp while cleansing gently.",
        price: 119000,
        unit: "250 ml",
        unitPrice: "Rp476/ml",
        images: [IMG.serum, IMG.texture, IMG.ingredients],
        badges: ["Fragrance free"],
        designedFor: ['Itchy scalp', 'Sensitive skin', 'Fragrance-free care'],
        routineStage: "cleanse",
        usage: "Massage into scalp, rinse well.",
        certifications: ["BPOM", "Halal"],
        variants: [
            { id: "250ml", label: "250 ml", price: 119000 },
            { id: "refill", label: "Refill", price: 95000 },
        ],
        ingredients: [
            { name: "Botanical oils", purpose: "Soothes the scalp", image: IMG.ingredients },
            { name: "Coconut-derived emollients", purpose: "Cleanses gently", image: IMG.texture },
        ],
        impact: {
            lowerWaste: "Refill available",
            plastic: "Refill saves 1 bottle",
            localSupport: "Local producer network",
            sourcing: "Responsible sourcing",
            methodology: "Estimated from refill adoption rate.",
        },
    },
];

export const getProductBySlug = (slug) =>
    PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
export const getProductById = (id) => PRODUCTS.find((p) => p.id === id);

export const CONCERNS = [
    "For you",
    "Eczema care",
    "Dryness",
    "Skin barrier",
    "Redness",
    "Itching",
    "Sensitive skin",
];

export const CATEGORIES = [
    "All",
    "Body care",
    "Face care",
    "Hair care",
    "Baby care",
    "Bundles",
];
