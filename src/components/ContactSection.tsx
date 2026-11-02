"use client";
import { useEffect, useState } from "react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";

export default function ContactSection() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => {});
    }, []);

    const showMap = config.map_active && config.map_embed_url;
    const showContact = config.contact_active;

    if (!showMap && !showContact) return null;

    const cleanPhone = (config.contact_phone || "").replace(/[^\d+]/g, "");

    return (
        <section id="contacto" className="py-24 bg-[#07090f] border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                {/* Datos de contacto */}
                {showContact && (
                    <div className={showMap ? "lg:col-span-5 flex flex-col justify-between" : "lg:col-span-12"}>
                        <div>
                            <span className="section-kicker mb-4">
                                <MessageSquare size={12} />
                                Atención Directa
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
                                {config.contact_title || "Contacto"}
                            </h2>
                            <p className="text-slate-400 text-sm mb-8">
                                Consultanos por presupuestos a medida, producción por volumen o asesoramiento técnico.
                            </p>

                            <div className="space-y-3.5">
                                {config.contact_address && (
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d121c] border border-white/[0.08] hover:border-white/15 transition-colors">
                                        <div className="w-11 h-11 rounded-xl bg-[#00CFFF]/10 flex items-center justify-center text-[#00CFFF] flex-shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dirección</h4>
                                            <p className="text-white font-semibold text-sm mt-0.5">{config.contact_address}</p>
                                        </div>
                                    </div>
                                )}

                                {config.contact_phone && (
                                    <a
                                        href={cleanPhone ? `tel:${cleanPhone}` : undefined}
                                        className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d121c] border border-white/[0.08] hover:border-[#E91E8C]/40 transition-colors group"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-[#E91E8C]/10 flex items-center justify-center text-[#E91E8C] flex-shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Teléfono / WhatsApp</h4>
                                            <p className="text-white group-hover:text-[#E91E8C] font-semibold text-sm mt-0.5 transition-colors">
                                                {config.contact_phone}
                                            </p>
                                        </div>
                                    </a>
                                )}

                                {config.contact_email && (
                                    <a
                                        href={`mailto:${config.contact_email}`}
                                        className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d121c] border border-white/[0.08] hover:border-[#FFE000]/40 transition-colors group"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-[#FFE000]/10 flex items-center justify-center text-[#FFE000] flex-shrink-0">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Correo electrónico</h4>
                                            <p className="text-white group-hover:text-[#FFE000] font-semibold text-sm mt-0.5 transition-colors">
                                                {config.contact_email}
                                            </p>
                                        </div>
                                    </a>
                                )}

                                {config.contact_schedule && (
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d121c] border border-white/[0.08]">
                                        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 flex-shrink-0">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Horario de atención</h4>
                                            <p className="text-white font-semibold text-sm mt-0.5">{config.contact_schedule}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mapa */}
                {showMap && (
                    <div className={showContact ? "lg:col-span-7 flex flex-col" : "lg:col-span-12 flex flex-col"}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black uppercase tracking-wide text-white">
                                {config.map_title || "Nuestra Ubicación"}
                            </h3>
                        </div>
                        <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-[#0d121c] relative shadow-2xl min-h-[360px]">
                            <iframe
                                src={config.map_embed_url}
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={config.map_title || "Ubicación"}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
