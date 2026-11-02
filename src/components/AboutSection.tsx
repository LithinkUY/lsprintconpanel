"use client";
import { useEffect, useState } from "react";
import { Layers, ShieldCheck, Zap } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";

export default function AboutSection() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => {});
    }, []);

    if (!config.about_active) return null;

    const pillars = [
        { icon: Layers, label: "Soluciones integrales", color: "#00CFFF" },
        { icon: Zap, label: "Entrega ágil", color: "#FFE000" },
        { icon: ShieldCheck, label: "Calidad garantizada", color: "#E91E8C" },
    ];

    return (
        <section className="relative py-24 bg-[#07090f] overflow-hidden border-t border-white/[0.06]">
            {/* Luz ambiental */}
            <div
                className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20"
                style={{ background: "radial-gradient(circle, rgba(0,207,255,0.35), transparent 70%)" }}
            />

            <div className="relative max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Texto */}
                    <div className={config.about_image_url ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"}>
                        <span className="section-kicker mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF]" />
                            Quiénes Somos
                        </span>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-tight">
                            {config.about_title || "Sobre Nosotros"}
                        </h2>

                        <div
                            className="text-slate-300/85 text-base sm:text-lg space-y-4 leading-relaxed [&>p]:mb-4 [&>strong]:text-white"
                            dangerouslySetInnerHTML={{ __html: config.about_text || "" }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-white/10">
                            {pillars.map(({ icon: Icon, label, color }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d121c] border border-white/[0.07]"
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${color}15`, color }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200 leading-snug">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Imagen enmarcada */}
                    {config.about_image_url && (
                        <div className="lg:col-span-5 relative">
                            <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#00CFFF]/20 via-transparent to-[#E91E8C]/20 blur-xl pointer-events-none" />
                            <div className="relative rounded-3xl overflow-hidden border border-white/12 bg-[#0d121c] shadow-2xl p-2">
                                <div className="rounded-2xl overflow-hidden relative">
                                    <img
                                        src={config.about_image_url}
                                        alt={config.about_title || "Sobre Nosotros"}
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/50 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
