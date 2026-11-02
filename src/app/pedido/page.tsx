"use client";
import { useState, useEffect, useMemo } from "react";
import Footer from "@/components/Footer";
import { Search, SlidersHorizontal, X, ShoppingCart, Tag, Ruler, Share2, Check, Sparkles, Printer } from "lucide-react";
import { Variant } from "@/lib/types";

interface Product {
    id: number;
    service_slug: string;
    service_name: string;
    service_color: string;
    name: string;
    description: string;
    price?: number;
    price_per_m2?: number;
    unit?: string;
    image_url?: string;
    price_visible: boolean;
    calculator_enabled: boolean;
    active: boolean;
    variant_ids?: number[];
}

interface ServiceRaw {
    id: number;
    slug: string;
    name: string;
    color: string;
    active: boolean;
    products: {
        id: number;
        service_slug: string;
        name: string;
        description: string;
        price?: number;
        price_per_m2?: number;
        unit?: string;
        image_url?: string;
        price_visible: boolean;
        calculator_enabled: boolean;
        active: boolean;
        variant_ids?: number[];
    }[];
}

export default function PedidoPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [calcProduct, setCalcProduct] = useState<Product | null>(null);
    const [calcWidth, setCalcWidth] = useState("");
    const [calcHeight, setCalcHeight] = useState("");
    const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
    const [copied, setCopied] = useState(false);
    const [allVariants, setAllVariants] = useState<Variant[]>([]);
    const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [uyuRate, setUyuRate] = useState(43);

    useEffect(() => {
        Promise.all([
            fetch("/api/services").then(r => r.json()),
            fetch("/api/variants").then(r => r.json()),
            fetch("/api/config?key=pricing").then(r => r.json())
        ])
            .then(([services, variants, pricingCfg]: [ServiceRaw[], Variant[], { uyu_rate?: number } | null]) => {
                if (pricingCfg?.uyu_rate) setUyuRate(Number(pricingCfg.uyu_rate));
                setAllVariants(Array.isArray(variants) ? variants.filter(v => v.active) : []);
                const products: Product[] = [];
                for (const s of services || []) {
                    if (!s.active) continue;
                    for (const p of s.products ?? []) {
                        if (!p.active) continue;
                        products.push({
                            ...p,
                            service_slug: s.slug,
                            service_name: s.name,
                            service_color: s.color ?? "#00CFFF",
                            price_per_m2: p.price_per_m2 != null ? Number(p.price_per_m2) : undefined,
                            variant_ids: p.variant_ids
                        });
                    }
                }
                setAllProducts(products);
                setLoading(false);

                const searchParams = new URLSearchParams(window.location.search);
                const productId = searchParams.get("producto");
                if (productId) {
                    const p = products.find(prod => prod.id.toString() === productId);
                    if (p) setDetailsProduct(p);
                }
            })
            .catch(() => setLoading(false));
    }, []);

    const categories = useMemo(() => {
        const seen = new Map<string, string>();
        for (const p of allProducts) seen.set(p.service_slug, p.service_name);
        return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
    }, [allProducts]);

    const filtered = useMemo(() => {
        return allProducts.filter(p => {
            const matchSearch = !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase()) ||
                p.service_name.toLowerCase().includes(search.toLowerCase());
            const matchCat = selectedCategory === "all" || p.service_slug === selectedCategory;
            const min = priceMin ? Number(priceMin) : null;
            const max = priceMax ? Number(priceMax) : null;
            const matchPrice = (!min || (p.price ?? 0) >= min) && (!max || (p.price ?? 0) <= max);
            return matchSearch && matchCat && matchPrice;
        });
    }, [allProducts, search, selectedCategory, priceMin, priceMax]);

    const formatAmount = (usd: number) => `$ ${(usd * uyuRate).toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const goToCheckout = (p: Product, w?: number, h?: number, selVarIds?: number[]) => {
        const m2 = w && h ? parseFloat((w * h).toFixed(4)) : undefined;
        const pricePerM2 = p.price_per_m2 ?? p.price ?? 0;
        const basePriceUSD = m2 ? pricePerM2 * m2 : (p.price ?? 0);

        let variantsTotalUSD = 0;
        const variantNames: string[] = [];
        (selVarIds || []).forEach(vid => {
            const v = allVariants.find(x => x.id === vid);
            if (v) {
                if (v.price_type === "percent") {
                    const costUSD = basePriceUSD * (v.price_percent / 100);
                    variantsTotalUSD += costUSD;
                    variantNames.push(`${v.name} (+${formatAmount(costUSD)})`);
                } else {
                    variantsTotalUSD += v.price;
                    variantNames.push(`${v.name} (+${formatAmount(v.price)})`);
                }
            }
        });

        const totalUSD = basePriceUSD + variantsTotalUSD;

        const cartItem = {
            service: p.service_name,
            product: p.name,
            productId: String(p.id),
            serviceSlug: p.service_slug,
            quantity: 1,
            width: w,
            height: h,
            m2,
            variants: variantNames,
            basePrice: basePriceUSD * uyuRate,
            total: totalUSD * uyuRate,
            currency: "UYU",
            uyu_rate: uyuRate,
        };
        sessionStorage.setItem("checkout_cart", JSON.stringify(cartItem));
        setCartCount(c => c + 1);
        window.location.href = "/checkout";
    };

    const handleQuote = (p: Product) => {
        if (p.calculator_enabled) {
            setCalcWidth("");
            setCalcHeight("");
            setSelectedVariantIds([]);
            setCalcProduct(p);
        } else {
            goToCheckout(p);
        }
    };

    const openDetails = (p: Product) => {
        setCalcWidth("");
        setCalcHeight("");
        setSelectedVariantIds([]);
        setDetailsProduct(p);
        setCopied(false);
        window.history.pushState({}, "", `/pedido?producto=${p.id}`);
    };

    const closeDetails = () => {
        setDetailsProduct(null);
        window.history.pushState({}, "", `/pedido`);
    };

    const handleShare = () => {
        if (!detailsProduct) return;
        const url = window.location.origin + `/pedido?producto=${detailsProduct.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const calcW = parseFloat(calcWidth) || 0;
    const calcH = parseFloat(calcHeight) || 0;
    const calcM2 = calcW > 0 && calcH > 0 ? calcW * calcH : 0;
    const activeProduct = calcProduct || detailsProduct;

    let calcPrice: number | null = null;
    if (activeProduct) {
        if (activeProduct.calculator_enabled) {
            if (calcM2 > 0) {
                const base = (activeProduct.price_per_m2 ?? activeProduct.price ?? 0) * calcM2;
                let vTotal = 0;
                selectedVariantIds.forEach(vid => {
                    const v = allVariants.find(x => x.id === vid);
                    if (v) vTotal += v.price_type === "percent" ? base * (v.price_percent / 100) : v.price;
                });
                calcPrice = base + vTotal;
            }
        } else {
            const base = activeProduct.price ?? 0;
            let vTotal = 0;
            selectedVariantIds.forEach(vid => {
                const v = allVariants.find(x => x.id === vid);
                if (v) vTotal += v.price_type === "percent" ? base * (v.price_percent / 100) : v.price;
            });
            calcPrice = base + vTotal;
        }
    }

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("all");
        setPriceMin("");
        setPriceMax("");
    };

    const hasFilters = search || selectedCategory !== "all" || priceMin || priceMax;

    return (
        <div className="min-h-screen flex flex-col bg-[#07090f]">
            {/* Lightbox de imagen */}
            {zoomedImage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05080f]/92 backdrop-blur-md p-4" onClick={() => setZoomedImage(null)}>
                    <img src={zoomedImage} alt="Zoom" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" />
                    <button onClick={() => setZoomedImage(null)} className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                        <X size={22} />
                    </button>
                </div>
            )}

            {/* Modal Detalles de Producto */}
            {detailsProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#05080f]/85 backdrop-blur-md p-4" onClick={closeDetails}>
                    <div className="bg-[#0d121c] border border-white/12 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div
                            className="relative h-60 shrink-0 bg-[#141c2b] flex items-center justify-center group"
                            style={{ background: detailsProduct.image_url ? "transparent" : `${detailsProduct.service_color}22` }}
                        >
                            {detailsProduct.image_url ? (
                                <img
                                    src={detailsProduct.image_url}
                                    alt={detailsProduct.name}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setZoomedImage(detailsProduct.image_url!)}
                                />
                            ) : (
                                <Printer size={56} className="text-slate-600" />
                            )}
                            <button onClick={closeDetails} className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 text-white transition-colors border border-white/10">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col flex-1 min-h-0">
                            <div className="flex items-start justify-between mb-4 shrink-0">
                                <div>
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white mb-2 inline-block" style={{ background: detailsProduct.service_color }}>
                                        {detailsProduct.service_name}
                                    </span>
                                    <h2 className="text-2xl font-black text-white leading-tight">{detailsProduct.name}</h2>
                                </div>
                                {detailsProduct.price_visible && (calcPrice != null || detailsProduct.price != null) && (
                                    <div className="text-right ml-4 shrink-0">
                                        <div className="text-2xl font-black text-[#00CFFF]">
                                            {calcPrice !== null ? formatAmount(calcPrice) : formatAmount(Number(detailsProduct.price))}
                                        </div>
                                        {detailsProduct.unit && <div className="text-xs text-slate-400">/ {detailsProduct.unit}</div>}
                                    </div>
                                )}
                            </div>

                            <div className="overflow-y-auto pr-1 flex-1 mb-4 space-y-5">
                                <div className="text-sm text-slate-300 leading-relaxed">
                                    {detailsProduct.description ? (
                                        <p className="whitespace-pre-wrap">{detailsProduct.description}</p>
                                    ) : (
                                        <p className="italic text-slate-500">Sin descripción disponible.</p>
                                    )}
                                </div>

                                {detailsProduct.variant_ids && detailsProduct.variant_ids.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opciones adicionales</p>
                                        <div className="space-y-2">
                                            {detailsProduct.variant_ids.map(vid => {
                                                const v = allVariants.find(x => x.id === vid);
                                                if (!v) return null;
                                                const isSelected = selectedVariantIds.includes(vid);
                                                return (
                                                    <label key={vid} className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${isSelected ? "border-[#00CFFF]/50 bg-[#00CFFF]/10" : "border-white/10 bg-[#141c2b] hover:border-white/20"}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-[#00CFFF] rounded"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedVariantIds([...selectedVariantIds, vid]);
                                                                else setSelectedVariantIds(selectedVariantIds.filter(id => id !== vid));
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-white">{v.name}</p>
                                                            {v.description && <p className="text-xs text-slate-400 mt-0.5">{v.description}</p>}
                                                        </div>
                                                        <div className="text-xs font-bold text-[#00CFFF]">
                                                            {v.price_type === "fixed" ? `+${formatAmount(v.price)}` : `+${v.price_percent}%`}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {detailsProduct.calculator_enabled && (
                                    <div className="bg-[#141c2b] rounded-2xl p-4 border border-white/10">
                                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Calculadora de m²</p>
                                        <div className="flex gap-3 mb-4">
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-400 block mb-1 font-medium">Ancho (metros)</label>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={calcWidth} onChange={e => setCalcWidth(e.target.value)}
                                                    placeholder="ej: 1.50"
                                                    className="dark-input text-center font-semibold"
                                                />
                                            </div>
                                            <div className="flex items-end pb-2 text-slate-500 font-light text-xl">×</div>
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-400 block mb-1 font-medium">Alto (metros)</label>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={calcHeight} onChange={e => setCalcHeight(e.target.value)}
                                                    placeholder="ej: 2.00"
                                                    className="dark-input text-center font-semibold"
                                                />
                                            </div>
                                        </div>
                                        <div className="rounded-xl p-3 text-center bg-[#07090f] border border-white/10">
                                            {calcM2 > 0 ? (
                                                <>
                                                    <p className="text-xl font-black text-[#00CFFF]">{calcM2.toFixed(2)} m²</p>
                                                    {detailsProduct.price_visible && calcPrice != null && (
                                                        <p className="text-sm text-slate-300 font-semibold mt-1">
                                                            {formatAmount(calcPrice)}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-slate-500 text-xs">Ingresá ancho y alto para calcular</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2.5 pt-4 border-t border-white/10 shrink-0">
                                <button
                                    onClick={closeDetails}
                                    className="flex-1 py-3 rounded-xl border border-white/10 font-semibold text-slate-300 hover:bg-white/5 transition-colors text-sm"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleShare}
                                    className={`w-12 flex items-center justify-center rounded-xl border transition-colors ${copied ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "border-white/10 text-slate-300 hover:bg-white/5"}`}
                                    title="Copiar enlace del producto"
                                >
                                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                                </button>
                                <button
                                    onClick={() => {
                                        if (detailsProduct.calculator_enabled) {
                                            if (calcM2 > 0) goToCheckout(detailsProduct, calcW || undefined, calcH || undefined, selectedVariantIds);
                                        } else {
                                            goToCheckout(detailsProduct, undefined, undefined, selectedVariantIds);
                                        }
                                        closeDetails();
                                    }}
                                    disabled={detailsProduct.calculator_enabled && !calcM2}
                                    className="flex-1 py-3 rounded-xl font-black text-sm text-[#05080f] bg-[#00CFFF] hover:bg-[#33d9ff] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    <ShoppingCart size={17} /> Pedir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Calculadora m² rápida */}
            {calcProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080f]/85 backdrop-blur-md p-4">
                    <div className="bg-[#0d121c] border border-white/12 rounded-3xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00CFFF]/15 text-[#00CFFF]">
                                    <Ruler size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm leading-tight">{calcProduct.name}</p>
                                    <p className="text-xs text-slate-400">{calcProduct.service_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setCalcProduct(null)} className="p-2 rounded-xl hover:bg-white/10 text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Calculadora de m²</p>

                        <div className="flex gap-3 mb-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-400 block mb-1 font-medium">Ancho (m)</label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={calcWidth} onChange={e => setCalcWidth(e.target.value)}
                                    placeholder="ej: 1.50"
                                    className="dark-input text-center font-semibold"
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-end pb-2 text-slate-500 font-light text-xl">×</div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-400 block mb-1 font-medium">Alto (m)</label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={calcHeight} onChange={e => setCalcHeight(e.target.value)}
                                    placeholder="ej: 2.00"
                                    className="dark-input text-center font-semibold"
                                />
                            </div>
                        </div>

                        {calcProduct.variant_ids && calcProduct.variant_ids.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opciones adicionales</p>
                                <div className="space-y-2">
                                    {calcProduct.variant_ids.map(vid => {
                                        const v = allVariants.find(x => x.id === vid);
                                        if (!v) return null;
                                        const isSelected = selectedVariantIds.includes(vid);
                                        return (
                                            <label key={vid} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? "border-[#00CFFF]/50 bg-[#00CFFF]/10" : "border-white/10 bg-[#141c2b]"}`}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[#00CFFF] rounded"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedVariantIds([...selectedVariantIds, vid]);
                                                        else setSelectedVariantIds(selectedVariantIds.filter(id => id !== vid));
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-white">{v.name}</p>
                                                </div>
                                                <div className="text-xs font-bold text-[#00CFFF]">
                                                    {v.price_type === "fixed" ? `+${formatAmount(v.price)}` : `+${v.price_percent}%`}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl p-4 mb-4 text-center bg-[#07090f] border border-white/10">
                            {calcM2 > 0 ? (
                                <>
                                    <p className="text-2xl font-black text-[#00CFFF]">{calcM2.toFixed(2)} m²</p>
                                    {calcProduct.price_visible && calcPrice != null && (
                                        <p className="text-sm text-slate-200 font-semibold mt-1">
                                            {formatAmount(calcPrice)}
                                            {calcProduct.price_per_m2 && (
                                                <span className="text-xs text-slate-400 ml-1 font-normal">({formatAmount(calcProduct.price_per_m2)}/m²)</span>
                                            )}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-slate-500 text-xs">Ingresá ancho y alto para calcular</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCalcProduct(null)}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    goToCheckout(calcProduct, calcW || undefined, calcH || undefined, selectedVariantIds);
                                    setCalcProduct(null);
                                }}
                                disabled={!calcM2}
                                className="flex-1 py-2.5 rounded-xl text-sm font-black text-[#05080f] bg-[#00CFFF] hover:bg-[#33d9ff] transition-colors disabled:opacity-40"
                            >
                                Cotizar →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-28 pb-20">
                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-end justify-between">
                    <div>
                        <span className="section-kicker mb-3">
                            <Sparkles size={12} />
                            Pedidos Online
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                            Catálogo de <span className="brand-gradient-text">Productos</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {loading ? "Cargando opciones…" : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors sm:hidden ${showFilters ? "bg-[#00CFFF] text-[#05080f] border-[#00CFFF]" : "bg-[#0d121c] border-white/10 text-slate-200"}`}
                        >
                            <SlidersHorizontal size={15} /> Filtros
                        </button>
                        {cartCount > 0 && (
                            <a href="/checkout" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00CFFF] text-[#05080f] text-xs font-black uppercase tracking-wider hover:bg-[#33d9ff] transition-colors">
                                <ShoppingCart size={15} /> Ver pedido ({cartCount})
                            </a>
                        )}
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative mb-8">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar lonas, vinilos, cartelería, sublimación…"
                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-white/10 bg-[#0d121c] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00CFFF]/50 transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Filtros laterales */}
                    <aside className={`flex-shrink-0 w-full sm:w-60 ${showFilters ? "block" : "hidden"} sm:block`}>
                        <div className="bg-[#0d121c] rounded-3xl border border-white/10 p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                                    <SlidersHorizontal size={14} className="text-[#00CFFF]" /> Filtros
                                </span>
                                {hasFilters && (
                                    <button onClick={clearFilters} className="text-xs text-[#00CFFF] hover:underline font-semibold">Limpiar</button>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Tag size={11} /> Categoría
                                </p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSelectedCategory("all")}
                                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${selectedCategory === "all" ? "bg-[#00CFFF]/15 text-[#00CFFF] border border-[#00CFFF]/30" : "text-slate-300 hover:bg-white/5"}`}
                                    >
                                        Todas las categorías
                                    </button>
                                    {categories.map(c => (
                                        <button
                                            key={c.slug}
                                            onClick={() => setSelectedCategory(c.slug)}
                                            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${selectedCategory === c.slug ? "bg-[#00CFFF]/15 text-[#00CFFF] border border-[#00CFFF]/30" : "text-slate-300 hover:bg-white/5"}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Rango base (USD)</p>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number" placeholder="Mín" value={priceMin}
                                        onChange={e => setPriceMin(e.target.value)}
                                        className="w-full bg-[#141c2b] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00CFFF]/50"
                                    />
                                    <span className="text-slate-500 text-xs">–</span>
                                    <input
                                        type="number" placeholder="Máx" value={priceMax}
                                        onChange={e => setPriceMax(e.target.value)}
                                        className="w-full bg-[#141c2b] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00CFFF]/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Grilla de productos */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-[#0d121c] rounded-3xl border border-white/5 h-72 animate-pulse" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 bg-[#0d121c] rounded-3xl border border-white/10">
                                <p className="text-slate-400 font-semibold">No se encontraron productos con esos filtros.</p>
                                {hasFilters && (
                                    <button onClick={clearFilters} className="mt-3 text-[#00CFFF] text-sm font-bold hover:underline">Limpiar filtros</button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filtered.map(p => (
                                    <ProductCard key={p.id} product={p} onQuote={handleQuote} onViewDetails={openDetails} formatAmount={formatAmount} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

function ProductCard({ product: p, onQuote, onViewDetails, formatAmount }: { product: Product; onQuote: (p: Product) => void; onViewDetails: (p: Product) => void; formatAmount: (usd: number) => string }) {
    return (
        <div
            className="bg-[#0d121c] rounded-3xl border border-white/10 hover:border-[#00CFFF]/45 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col group cursor-pointer shadow-lg"
            onClick={() => onViewDetails(p)}
        >
            <div
                className="h-44 flex items-center justify-center relative overflow-hidden bg-[#141c2b]"
                style={{ background: p.image_url ? undefined : `linear-gradient(145deg, ${p.service_color}33, #0d121c)` }}
            >
                {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <Printer size={42} className="text-slate-600" />
                )}
                <span
                    className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-md"
                    style={{ background: p.service_color }}
                >
                    {p.service_name}
                </span>
                {p.calculator_enabled && (
                    <span className="absolute top-3 right-3 text-[10px] bg-black/65 backdrop-blur-md text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-full font-bold">
                        m² a medida
                    </span>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-[#00CFFF] transition-colors">{p.name}</h3>
                {p.description && (
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 flex-1 leading-relaxed">{p.description}</p>
                )}

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-end justify-between">
                    {p.price_visible && p.price != null ? (
                        <div>
                            <span className="text-lg font-black text-[#00CFFF]">{formatAmount(Number(p.price))}</span>
                            {p.unit && <span className="text-xs text-slate-400 ml-1">/ {p.unit}</span>}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400 italic">Precio a consultar</span>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuote(p);
                    }}
                    className="mt-3.5 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#05080f] bg-[#00CFFF] hover:bg-[#33d9ff] transition-colors"
                >
                    Cotizar / Pedir
                </button>
            </div>
        </div>
    );
}
