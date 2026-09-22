"use client";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";

export default function ClientsSlider() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => { });
    }, []);

    if (!config.clients_slider_active || !config.clients || config.clients.length === 0) return null;

    return (
        <section className="py-20 bg-[#111]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black uppercase text-white">
                        {config.clients_slider_title || "NUESTROS CLIENTES"}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => emblaApi?.scrollPrev()}
                            className="w-9 h-9 rounded-full border border-[#2a2a2a] flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => emblaApi?.scrollNext()}
                            className="w-9 h-9 rounded-full border border-[#2a2a2a] flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4 items-center">
                        {config.clients.map((client, idx) => (
                            <div key={idx} className="flex-shrink-0 bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#00CFFF]/30 transition-all" style={{ width: "200px" }}>
                                <img src={client.logo_url} alt={client.name} className="w-full h-16 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
