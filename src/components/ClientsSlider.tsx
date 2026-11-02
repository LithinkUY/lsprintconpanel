"use client";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";

export default function ClientsSlider() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => {});
    }, []);

    if (!config.clients_slider_active || !config.clients || config.clients.length === 0) return null;

    return (
        <section className="py-24 bg-[#090d16] border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <span className="section-kicker mb-3">
                            <Award size={12} />
                            Confían en nosotros
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                            {config.clients_slider_title || "Nuestros Clientes"}
                        </h2>
                    </div>

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

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-5 items-center">
                        {config.clients.map((client, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 bg-[#0d121c] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00CFFF]/50 transition-all duration-300 relative group w-[260px] sm:w-[300px] md:flex-1 md:min-w-[210px] md:max-w-[320px] shadow-lg"
                                style={{ aspectRatio: "16/9" }}
                            >
                                <img
                                    src={client.logo_url}
                                    alt={client.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
