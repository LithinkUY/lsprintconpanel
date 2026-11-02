"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Layers } from "lucide-react";
import { Service, ServiceProduct } from "@/lib/types";
import ServiceProductModal from "./ServiceProductModal";

function mapApiService(r: Record<string, unknown>): Service {
    return {
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        description: String(r.description ?? ""),
        image_url: String(r.image_url ?? r.icon ?? ""),
        color: String(r.color ?? "#141c2b"),
        order: Number(r.sort_order ?? r.order ?? 0),
        active: r.active === true || r.active === "true",
        products: Array.isArray(r.products)
            ? (r.products as Record<string, unknown>[]).map(p => ({
                id: String(p.id ?? ""),
                service_id: String(p.service_id ?? r.id ?? ""),
                service_slug: String(p.service_slug ?? r.slug ?? ""),
                name: String(p.name ?? ""),
                description: String(p.description ?? ""),
                price: p.price != null ? Number(p.price) : undefined,
                unit: p.unit ? String(p.unit) : undefined,
                image_url: p.image_url ? String(p.image_url) : undefined,
                price_visible: p.price_visible !== false,
                calculator_enabled: p.calculator_enabled === true,
                price_per_m2: p.price_per_m2 != null ? Number(p.price_per_m2) : undefined,
                active: p.active === true || p.active === "true",
                order: Number(p.sort_order ?? p.order ?? 0),
                sort_order: Number(p.sort_order ?? 0),
                details: Array.isArray(p.details) ? p.details : [],
                variant_ids: Array.isArray(p.variant_ids) ? (p.variant_ids as number[]) : [],
            } as ServiceProduct))
            : [],
    };
}

function ServiceCard({ service, index, onClick }: { service: Service; index: number; onClick: () => void }) {
    const activeCount = (service.products ?? []).filter(p => p.active).length;

    return (
        <button
            onClick={onClick}
            className="relative rounded-3xl overflow-hidden flex-shrink-0 cursor-pointer group text-left border border-white/10 hover:border-[#00CFFF]/50 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
            style={{ width: "288px", height: "380px" }}
        >
            {/* Fondo / Imagen */}
            <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{
                    background: service.image_url
                        ? `url(${service.image_url}) center/cover`
                        : `linear-gradient(145deg, ${service.color}, #07090f)`,
                    backgroundColor: service.color,
                }}
            />

            {/* Velo de contraste */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/45 to-black/15" />

            {/* Top bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest bg-black/55 backdrop-blur-md text-white/80 border border-white/10">
                    {String(index + 1).padStart(2, "0")}
                </span>
                {activeCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00CFFF]/15 backdrop-blur-md text-[#00CFFF] border border-[#00CFFF]/30">
                        {activeCount} {activeCount === 1 ? "opción" : "opciones"}
                    </span>
                )}
            </div>

            {/* Contenido inferior */}
            <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-10">
                <h3 className="text-white font-black text-xl tracking-tight leading-snug mb-1.5 group-hover:text-[#00CFFF] transition-colors">
                    {service.name}
                </h3>
                {service.description && (
                    <p className="text-slate-300/75 text-xs leading-relaxed line-clamp-2 mb-4">
                        {service.description}
                    </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 group-hover:text-[#00CFFF] transition-colors">
                        Ver opciones y cotizar
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#00CFFF] text-white group-hover:text-[#04080f] flex items-center justify-center transition-all">
                        <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>
        </button>
    );
}

export default function ServicesSlider() {
    const [list, setList] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });

    useEffect(() => {
        fetch("/api/services")
            .then(r => r.json())
            .then((rows: unknown[]) =>
                setList(rows.map(raw => mapApiService(raw as Record<string, unknown>)))
            )
            .catch(err => console.error("Error cargando servicios:", err))
            .finally(() => setLoading(false));
    }, []);

    const active = list.filter(s => s.active).sort((a, b) => a.order - b.order);

    return (
        <>
            <section className="relative py-24 bg-[#090d16] border-t border-white/[0.06] overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <span className="section-kicker mb-4">
                                <Layers size={12} />
                                Soluciones Gráficas
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                                Nuestros <span className="brand-gradient-text">Servicios</span>
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
                                Seleccioná una categoría para ver productos disponibles, calcular medidas y cotizar al instante.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/pedido"
                                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white transition-all"
                            >
                                Ver catálogo completo →
                            </Link>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => emblaApi?.scrollPrev()}
                                    aria-label="Anterior"
                                    className="w-10 h-10 rounded-xl bg-[#0d121c] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00CFFF]/50 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => emblaApi?.scrollNext()}
                                    aria-label="Siguiente"
                                    className="w-10 h-10 rounded-xl bg-[#0d121c] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00CFFF]/50 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex gap-5 overflow-hidden">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 rounded-3xl bg-[#111827] border border-white/5 animate-pulse"
                                    style={{ width: 288, height: 380 }}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && active.length === 0 && (
                        <p className="text-slate-500 text-sm py-10">No hay servicios activos configurados.</p>
                    )}

                    {!loading && active.length > 0 && (
                        <div className="overflow-hidden py-2 -my-2" ref={emblaRef}>
                            <div className="flex gap-5">
                                {active.map((service, idx) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        index={idx}
                                        onClick={() => setSelectedService(service)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <ServiceProductModal
                service={selectedService}
                onClose={() => setSelectedService(null)}
            />
        </>
    );
}
