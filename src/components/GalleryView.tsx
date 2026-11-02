"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryConfig, GalleryItem } from "@/lib/types";
import { X, Images } from "lucide-react";

export default function GalleryView({ config }: { config: GalleryConfig }) {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

    const filteredItems = activeCategory === "all"
        ? config.items
        : config.items.filter(item => item.category_id === activeCategory);

    return (
        <section className="py-16 bg-[#07090f] min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 studio-grid-bg opacity-40 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="section-kicker mb-4">
                        <Images size={12} />
                        Portafolio de Proyectos
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
                        Nuestra <span className="brand-gradient-text">Galería</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                        Explorá trabajos reales producidos en nuestro taller: impresión gran formato, cartelería, vinilos, sublimación y más.
                    </p>
                </div>

                {/* Filtros */}
                {config.categories.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                                activeCategory === "all"
                                    ? "bg-[#00CFFF] text-[#05080f] shadow-[0_0_20px_rgba(0,207,255,0.35)]"
                                    : "bg-[#0d121c] text-slate-300 hover:text-white border border-white/10 hover:border-[#00CFFF]/40"
                            }`}
                        >
                            Todos
                        </button>
                        {[...config.categories].sort((a, b) => a.order - b.order).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                                    activeCategory === cat.id
                                        ? "bg-[#00CFFF] text-[#05080f] shadow-[0_0_20px_rgba(0,207,255,0.35)]"
                                        : "bg-[#0d121c] text-slate-300 hover:text-white border border-white/10 hover:border-[#00CFFF]/40"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grilla */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                >
                    <AnimatePresence>
                        {filteredItems.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.25 }}
                                key={item.id}
                                className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#00CFFF]/50 bg-[#0d121c] shadow-lg"
                                onClick={() => setSelectedImage(item)}
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.title || "Trabajo realizado"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#05080f]/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                                    <h3 className="text-white font-bold text-sm transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                        {item.title || "Ver imagen ampliada"}
                                    </h3>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        No hay imágenes en esta categoría por el momento.
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="absolute inset-0 bg-[#05080f]/92 backdrop-blur-md" />

                        <button
                            className="absolute top-6 right-6 text-slate-300 hover:text-white z-10 bg-white/10 border border-white/10 p-2.5 rounded-xl transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={22} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="relative z-10 max-w-5xl w-full max-h-full flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.image_url}
                                alt={selectedImage.title || ""}
                                className="max-w-full max-h-[84vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                            />
                            {selectedImage.title && (
                                <p className="text-white mt-4 text-base font-bold tracking-wide">
                                    {selectedImage.title}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
