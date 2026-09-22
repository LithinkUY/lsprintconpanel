"use client";
import { useEffect, useState } from "react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";

export default function AboutSection() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => { });
    }, []);

    if (!config.about_active) return null;

    return (
        <section className="py-20 bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-[#00CFFF] mb-6">
                            {config.about_title || "Sobre Nosotros"}
                        </h2>
                        <div 
                            className="text-white/70 space-y-4 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: config.about_text || "" }} 
                        />
                    </div>
                    {config.about_image_url && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#E91E8C]/20 to-transparent mix-blend-overlay pointer-events-none" />
                            <img src={config.about_image_url} alt="Sobre Nosotros" className="w-full h-auto object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
