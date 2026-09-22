"use client";
import { useEffect, useState } from "react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactSection() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => { });
    }, []);

    const showMap = config.map_active && config.map_embed_url;
    const showContact = config.contact_active;

    if (!showMap && !showContact) return null;

    return (
        <section className="py-20 bg-[#111] border-t border-[#222]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Datos de contacto */}
                {showContact && (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black uppercase text-white mb-6">
                            {config.contact_title || "Contacto"}
                        </h2>
                        
                        <div className="space-y-6">
                            {config.contact_address && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#00CFFF]/10 flex items-center justify-center text-[#00CFFF] flex-shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Dirección</h4>
                                        <p className="text-white/60 mt-1">{config.contact_address}</p>
                                    </div>
                                </div>
                            )}

                            {config.contact_phone && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#E91E8C]/10 flex items-center justify-center text-[#E91E8C] flex-shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Teléfono</h4>
                                        <p className="text-white/60 mt-1">{config.contact_phone}</p>
                                    </div>
                                </div>
                            )}

                            {config.contact_email && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#FFE000]/10 flex items-center justify-center text-[#FFE000] flex-shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Email</h4>
                                        <p className="text-white/60 mt-1">{config.contact_email}</p>
                                    </div>
                                </div>
                            )}

                            {config.contact_schedule && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/80 flex-shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Horario</h4>
                                        <p className="text-white/60 mt-1">{config.contact_schedule}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mapa */}
                {showMap && (
                    <div className="h-full min-h-[400px] flex flex-col">
                        <h2 className="text-3xl font-black uppercase text-white mb-6">
                            {config.map_title || "Ubicación"}
                        </h2>
                        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative shadow-xl min-h-[300px]">
                            <iframe 
                                src={config.map_embed_url} 
                                className="absolute inset-0 w-full h-full border-0" 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
