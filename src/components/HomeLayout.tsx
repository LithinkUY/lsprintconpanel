"use client";
import { useEffect, useState } from "react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";
import HeroSection from "./HeroSection";
import ClientsSlider from "./ClientsSlider";
import AboutSection from "./AboutSection";
import ProcessSection from "./ProcessSection";
import ServicesSlider from "./ServicesSlider";
import ContactSection from "./ContactSection";

export default function HomeLayout() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { 
                if (val && typeof val === "object") {
                    setConfig({ ...mockSiteConfig, ...val });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />; // Evita parpadeos

    const order = config.home_sections_order || ["hero", "clients", "about", "process", "services", "contact"];

    return (
        <>
            {order.map((sectionId) => {
                switch (sectionId) {
                    case "hero": return <HeroSection key="hero" />;
                    case "clients": return <ClientsSlider key="clients" />;
                    case "about": return <AboutSection key="about" />;
                    case "process": return <ProcessSection key="process" />;
                    case "services": return <ServicesSlider key="services" />;
                    case "contact": return <ContactSection key="contact" />;
                    default: return null;
                }
            })}
        </>
    );
}
