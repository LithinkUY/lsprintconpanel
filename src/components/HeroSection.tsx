"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { mockSiteConfig } from "@/lib/mock-data";
import { getHeroMediaType, extractYoutubeId, getYoutubeBgEmbedUrl } from "@/lib/media";

export default function HeroSection() {
    const [config, setConfig] = useState<SiteConfig>(mockSiteConfig);
    const [line1Visible, setLine1Visible] = useState(false);
    const [line2Visible, setLine2Visible] = useState(false);
    const [subVisible, setSubVisible] = useState(false);
    const [btnsVisible, setBtnsVisible] = useState(false);

    const [subIdx, setSubIdx] = useState(0);
    const [textVisible, setTextVisible] = useState(false);
    const [isLtr, setIsLtr] = useState(true);

    useEffect(() => {
        fetch("/api/config?key=siteconfig")
            .then(r => r.json())
            .then(val => { if (val && typeof val === "object") setConfig({ ...mockSiteConfig, ...val }); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const t1 = setTimeout(() => setLine1Visible(true), 250);
        const t2 = setTimeout(() => setLine2Visible(true), 1100);
        const t3 = setTimeout(() => { setSubVisible(true); setTextVisible(true); }, 1800);
        const t4 = setTimeout(() => setBtnsVisible(true), 2200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, []);

    useEffect(() => {
        if (!subVisible) return;
        let pass = 0;
        const interval = setInterval(() => {
            pass++;
            if (pass % 2 === 1) {
                setIsLtr(false);
                setTextVisible(false);
            } else {
                setIsLtr(true);
                setSubIdx(prev => {
                    const subs = config.hero_subtitles?.length ? config.hero_subtitles : [config.hero_subtitle || ""];
                    return (prev + 1) % subs.length;
                });
                setTextVisible(true);
            }
        }, 3200);
        return () => clearInterval(interval);
    }, [subVisible, config]);

    const subtitles = config.hero_subtitles?.length
        ? config.hero_subtitles
        : [config.hero_subtitle || ""];
    const lines = (config.hero_title || "").split("\n").filter((l, idx) => idx === 0 || l.trim().length > 0);

    const mediaType = getHeroMediaType(config.hero_video_url);
    const youtubeId = mediaType === "youtube" ? extractYoutubeId(config.hero_video_url) : null;

    const inkColor = isLtr ? "#00CFFF" : "#E91E8C";

    return (
        <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center overflow-hidden bg-[#07090f]">
            {/* Media de fondo */}
            {mediaType === "youtube" && youtubeId && (
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <iframe
                        src={getYoutubeBgEmbedUrl(youtubeId)}
                        title="Hero Video Background"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] min-w-full min-h-full object-cover pointer-events-none"
                        style={{ filter: "brightness(0.38) contrast(1.08)" }}
                    />
                </div>
            )}
            {mediaType === "video" && (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.38) contrast(1.08)" }}
                    src={config.hero_video_url}
                />
            )}
            {mediaType === "image" && (
                <img
                    src={config.hero_video_url}
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.38) contrast(1.08)" }}
                />
            )}
            {mediaType === "none" && (
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, #07090f 0%, #0f172a 50%, #07090f 100%)" }}
                />
            )}

            {/* Capas atmosféricas y viñeta */}
            <div className="absolute inset-0 studio-grid-bg opacity-60 pointer-events-none" />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at 18% 35%, rgba(0,207,255,0.14) 0%, transparent 45%), radial-gradient(circle at 82% 70%, rgba(233,30,140,0.12) 0%, transparent 45%)",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(to right, rgba(7,9,15,0.92) 0%, rgba(7,9,15,0.68) 55%, rgba(7,9,15,0.28) 100%)",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "linear-gradient(to top, #07090f 0%, rgba(7,9,15,0.35) 35%, transparent 65%)",
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-28 pb-20">
                <div className="max-w-3xl">
                    {/* Logo opcional o Kicker del estudio */}
                    {config.hero_logo_url ? (
                        <div className="mb-7">
                            <img
                                src={config.hero_logo_url}
                                alt="Logo"
                                className="object-contain"
                                style={{ height: config.hero_logo_height || 120 }}
                            />
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/12 backdrop-blur-md mb-6">
                            <span className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#00CFFF]" />
                                <span className="w-2 h-2 rounded-full bg-[#E91E8C]" />
                                <span className="w-2 h-2 rounded-full bg-[#FFE000]" />
                            </span>
                            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-200">
                                Estudio Gráfico &amp; Producción Industrial
                            </span>
                        </div>
                    )}

                    {/* Titulares principales */}
                    <div className="mb-7 space-y-1">
                        <div className="overflow-hidden">
                            <h1
                                className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.98] text-white"
                                style={{
                                    clipPath: line1Visible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                                    opacity: line1Visible ? 1 : 0,
                                    transition: "clip-path 1s cubic-bezier(0.22,1,0.36,1), opacity 0.2s",
                                    textShadow: "0 8px 40px rgba(0,0,0,0.65)",
                                }}
                            >
                                {lines[0] || "CREAMOS SOLUCIONES A MEDIDA"}
                            </h1>
                        </div>
                        {lines[1] && (
                            <div className="overflow-hidden pt-1">
                                <div
                                    className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.98] text-transparent bg-clip-text bg-gradient-to-r from-[#00CFFF] via-white to-[#E91E8C]"
                                    style={{
                                        clipPath: line2Visible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                                        opacity: line2Visible ? 1 : 0,
                                        transition: "clip-path 1s cubic-bezier(0.22,1,0.36,1), opacity 0.2s",
                                    }}
                                >
                                    {lines[1]}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cápsula CMYK animada con especialidades */}
                    <div
                        className="inline-flex items-center gap-3.5 w-full max-w-xl px-4 py-3 rounded-2xl bg-[#0d121c]/75 backdrop-blur-xl border border-white/10 shadow-2xl mb-9"
                        style={{
                            opacity: subVisible ? 1 : 0,
                            transform: subVisible ? "translateY(0)" : "translateY(10px)",
                            transition: "opacity 0.5s ease, transform 0.5s ease",
                        }}
                    >
                        {/* Indicador CMYK lateral */}
                        <div className="flex gap-[2px] items-center flex-shrink-0">
                            <div className="w-1 h-7 rounded-full bg-[#00CFFF]" />
                            <div className="w-5 h-7 rounded-md flex flex-col overflow-hidden border border-white/10">
                                <div className="flex-1 bg-[#E91E8C]" />
                                <div className="flex-1 bg-[#FFE000]" />
                                <div className="flex-1 bg-slate-800" />
                            </div>
                        </div>

                        {/* Carril del cabezal + texto */}
                        <div className="relative flex-1 h-8 flex items-center overflow-hidden">
                            {subVisible && (
                                <div
                                    className="absolute top-0 bottom-0 pointer-events-none z-20 flex items-center"
                                    style={{
                                        animation: "printerSweepLoop 3.2s cubic-bezier(0.45,0,0.55,1) infinite alternate",
                                        width: "34px",
                                    }}
                                >
                                    <div
                                        className="absolute inset-y-0 right-full w-16 pointer-events-none"
                                        style={{ background: `linear-gradient(to left, ${inkColor}30, transparent)` }}
                                    />
                                    <div className="flex flex-col gap-[2px] bg-[#141c2b] border border-white/25 rounded-md px-[5px] py-[4px] shadow-xl">
                                        {["#00CFFF", "#E91E8C", "#FFE000", "#475569"].map((c, i) => (
                                            <div key={i} className="w-3.5 h-[2.5px] rounded-full" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <span
                                className="relative z-10 text-base sm:text-xl font-extrabold tracking-wide uppercase text-white whitespace-nowrap"
                                style={{
                                    opacity: textVisible ? 1 : 0,
                                    transition: textVisible
                                        ? "opacity 0.3s ease 1.5s"
                                        : "opacity 0.2s ease 1.3s",
                                }}
                            >
                                {subtitles[subIdx] ?? ""}
                            </span>
                        </div>

                        {/* Puntos de progreso */}
                        <div className="flex gap-1.5 items-center flex-shrink-0">
                            {subtitles.map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-full transition-all duration-300"
                                    style={{
                                        width: i === subIdx ? "18px" : "5px",
                                        height: "5px",
                                        backgroundColor: i === subIdx ? "#00CFFF" : "rgba(255,255,255,0.2)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Botones CTA */}
                    <div
                        className="flex flex-col sm:flex-row gap-3.5 mb-10"
                        style={{
                            opacity: btnsVisible ? 1 : 0,
                            transform: btnsVisible ? "translateY(0)" : "translateY(10px)",
                            transition: "all 0.5s ease",
                        }}
                    >
                        {config.hero_button1_text && (
                            <Link
                                href={config.hero_button1_url || "/pedido"}
                                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-black uppercase tracking-wider rounded-2xl text-[#05080f] bg-gradient-to-r from-[#00CFFF] to-[#3be1ff] shadow-[0_0_32px_rgba(0,207,255,0.32)] hover:shadow-[0_0_42px_rgba(0,207,255,0.52)] hover:-translate-y-0.5 transition-all"
                            >
                                <span>{config.hero_button1_text.replace(/→/g, "").trim()}</span>
                                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                        {config.hero_button2_text && (
                            <Link
                                href={config.hero_button2_url || "/contacto"}
                                className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-bold uppercase tracking-wider rounded-2xl text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#E91E8C]/50 backdrop-blur-md transition-all"
                            >
                                <span>{config.hero_button2_text}</span>
                            </Link>
                        )}
                    </div>

                    {/* Sellos de confianza rápidos */}
                    <div
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300/80"
                        style={{
                            opacity: btnsVisible ? 1 : 0,
                            transition: "opacity 0.6s ease 0.15s",
                        }}
                    >
                        {["Producción propia", "Alta definición UV & Láser", "Envíos a todo el país"].map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-[#00CFFF]" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
