"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Menu, X, ArrowUpRight, Sparkles } from "lucide-react";
import { NavItem, SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";

function BrandLogo({ config }: { config: SiteConfig }) {
    if (config.logo_url) {
        return (
            <Link href="/" className="flex items-center leading-none group">
                <img
                    src={config.logo_url}
                    alt={config.logo_text || "Lsprint"}
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ height: config.logo_height || 44 }}
                />
            </Link>
        );
    }

    const [c, m, y, w] = config.logo_colors || ["#00CFFF", "#E91E8C", "#FFE000", "#FFFFFF"];
    return (
        <Link href="/" className="flex flex-col items-start leading-none group">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white italic">
                {config.logo_text || "Lsprint"}
            </span>
            <div className="flex gap-[3px] mt-[3px]">
                {[c, m, y, w].map((color, i) => (
                    <div key={i} className="h-[3.5px] w-[13px] rounded-full" style={{ backgroundColor: color }} />
                ))}
            </div>
        </Link>
    );
}

function NavItemComponent({ item, active }: { item: NavItem; active: boolean }) {
    const [open, setOpen] = useState(false);

    const cleanChildren = item.children?.filter(
        c => !c.href.startsWith("/portal") && !c.label.toUpperCase().includes("PORTAL")
    );

    if (!cleanChildren || cleanChildren.length === 0) {
        return (
            <Link
                href={item.href}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                    active
                        ? "text-[#00CFFF] bg-[#00CFFF]/10"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
            >
                {item.label}
                {active && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] rounded-full bg-gradient-to-r from-[#00CFFF] to-[#E91E8C]" />
                )}
            </Link>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
                {item.label}
                <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 pt-2 z-50 min-w-[190px]">
                    <div className="bg-[#0d121c]/95 backdrop-blur-xl border border-white/10 rounded-2xl py-2 shadow-2xl">
                        {cleanChildren.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className="block px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-[#00CFFF] hover:bg-white/[0.05] transition-colors"
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const pathname = usePathname();
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => {
                if (val && typeof val === "object") {
                    setConfig({ ...mockSiteConfig, ...val });
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Ocultar Header público en rutas administrativas, visor privado y checkout
    if (
        pathname?.startsWith("/admin") ||
        pathname?.startsWith("/muestra") ||
        pathname?.startsWith("/checkout")
    ) {
        return null;
    }

    // Filtrar cualquier enlace heredado al portal de clientes o retiro con sesión
    const publicNavItems = (config.nav_items || []).filter((item) => {
        const upper = item.label.toUpperCase();
        if (upper.includes("PORTAL") || upper.includes("INICIAR") || upper.includes("REGISTR")) return false;
        if (item.href?.startsWith("/portal") || item.href === "/retiro") return false;
        return true;
    });

    const ctaBtn =
        publicNavItems.find((n) => n.label.toUpperCase().includes("PEDIDO") || n.href === "/pedido") ?? {
            label: "HACÉ TU PEDIDO",
            href: "/pedido",
        };

    const mainNav = publicNavItems.filter((n) => n !== ctaBtn);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 transition-all duration-300">
            <div
                className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
                    scrolled
                        ? "bg-[#0a0f18]/90 backdrop-blur-xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
                        : "bg-[#0a0f18]/70 backdrop-blur-md border border-white/[0.08]"
                }`}
            >
                <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
                    <BrandLogo config={config} />

                    {/* Navegación Desktop */}
                    <nav className="hidden lg:flex items-center gap-1.5">
                        <Link
                            href="/"
                            className={`relative px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                                pathname === "/"
                                    ? "text-[#00CFFF] bg-[#00CFFF]/10"
                                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                            }`}
                        >
                            Inicio
                            {pathname === "/" && (
                                <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] rounded-full bg-gradient-to-r from-[#00CFFF] to-[#E91E8C]" />
                            )}
                        </Link>
                        {mainNav.map((item) => (
                            <NavItemComponent
                                key={item.label}
                                item={item}
                                active={pathname === item.href}
                            />
                        ))}
                    </nav>

                    {/* Acción principal Desktop (sin inicio de sesión de clientes) */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            href={ctaBtn.href}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase text-[#04080f] bg-gradient-to-r from-[#00CFFF] via-[#38dcff] to-[#00CFFF] shadow-[0_0_24px_rgba(0,207,255,0.3)] hover:shadow-[0_0_32px_rgba(0,207,255,0.5)] hover:-translate-y-0.5 transition-all"
                        >
                            <Sparkles size={14} className="text-[#04080f]" />
                            <span>{ctaBtn.label}</span>
                            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>

                    {/* Botón Menú Móvil */}
                    <button
                        className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Abrir menú"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Línea sutil CMYK inferior */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00CFFF]/35 to-transparent" />

                {/* Menú Móvil */}
                {mobileOpen && (
                    <div className="lg:hidden px-4 py-4 border-t border-white/10 flex flex-col gap-1.5 bg-[#0a0f18]/95 rounded-b-2xl">
                        <Link
                            href="/"
                            onClick={() => setMobileOpen(false)}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                pathname === "/" ? "bg-[#00CFFF]/10 text-[#00CFFF]" : "text-slate-200 hover:bg-white/5"
                            }`}
                        >
                            Inicio
                        </Link>
                        {mainNav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                    pathname === item.href ? "bg-[#00CFFF]/10 text-[#00CFFF]" : "text-slate-200 hover:bg-white/5"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-2 mt-1 border-t border-white/10">
                            <Link
                                href={ctaBtn.href}
                                onClick={() => setMobileOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-[#04080f] bg-[#00CFFF] shadow-[0_0_20px_rgba(0,207,255,0.25)]"
                            >
                                {ctaBtn.label}
                                <ArrowUpRight size={15} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
