"use client";
import { useEffect, useState } from "react";
import { Workflow } from "lucide-react";

export interface ProcessStep {
    icon: string;
    label: string;
    description?: string;
    active: boolean;
    icon_url?: string;
    icon_color?: string;
}

export interface ProcessConfig {
    title: string;
    steps: ProcessStep[];
}

export const defaultProcessConfig: ProcessConfig = {
    title: "¿Cómo trabajamos?",
    steps: [
        { icon: "💡", label: "IDEA", description: "Nos contás tu idea y definimos juntos el alcance del proyecto.", active: true, icon_color: "#00CFFF" },
        { icon: "✏️", label: "DISEÑO", description: "Preparamos y verificamos los artes, materiales y medidas exactas.", active: true, icon_color: "#E91E8C" },
        { icon: "⚙️", label: "PRODUCCIÓN", description: "Fabricamos en nuestro taller con tecnología de alta precisión.", active: true, icon_color: "#FFE000" },
        { icon: "🚚", label: "ENTREGA", description: "Coordinamos entrega o colocación en tiempo y forma acordados.", active: true, icon_color: "#00CFFF" },
    ],
};

interface ProcessSectionProps {
    showAlways?: boolean;
}

const STEP_ACCENTS = ["#00CFFF", "#E91E8C", "#FFE000", "#38bdf8"];

function StepCard({ step, index }: { step: ProcessStep; index: number }) {
    const accent = step.icon_color || STEP_ACCENTS[index % STEP_ACCENTS.length];

    return (
        <div className="relative bg-[#0d121c] border border-white/[0.08] hover:border-white/20 rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
            {/* Barra superior de acento */}
            <div
                className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: accent }}
            />

            <div className="flex items-center justify-between">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: `${accent}14` }}
                >
                    {step.icon_url ? (
                        <img
                            src={step.icon_url}
                            alt={step.label}
                            className="w-8 h-8 object-contain"
                        />
                    ) : (
                        <span className="text-2xl select-none">{step.icon}</span>
                    )}
                </div>

                <span
                    className="text-xs font-black tracking-widest px-3 py-1 rounded-full border"
                    style={{
                        color: accent,
                        borderColor: `${accent}35`,
                        backgroundColor: `${accent}10`,
                    }}
                >
                    PASO {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">
                    {step.label}
                </h3>
                {step.description && (
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {step.description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function ProcessSection({ showAlways = false }: ProcessSectionProps) {
    const [cfg, setCfg] = useState<ProcessConfig>(defaultProcessConfig);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        fetch("/api/process")
            .then(r => r.json())
            .then((steps: (ProcessStep & { sort_order?: number })[]) => {
                if (Array.isArray(steps) && steps.length > 0) {
                    setCfg(prev => ({
                        title: prev.title,
                        steps: steps.map(s => ({
                            icon: String(s.icon ?? "⚙️"),
                            label: String(s.label),
                            description: String(s.description ?? ""),
                            active: Boolean(s.active),
                            icon_url: s.icon_url ?? undefined,
                            icon_color: s.icon_color ?? undefined,
                        })),
                    }));
                }
            })
            .catch(() => {});

        if (!showAlways) {
            fetch("/api/home-sections")
                .then(r => r.json())
                .then((sections: { type: string; active: boolean }[]) => {
                    if (Array.isArray(sections)) {
                        const ps = sections.find(s => s.type === "process");
                        if (ps && !ps.active) setHidden(true);
                    }
                })
                .catch(() => {});
        }
    }, [showAlways]);

    if (hidden) return null;

    const activeSteps = cfg.steps.filter(s => s.active);

    return (
        <section className="py-24 bg-[#07090f] border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-2xl mb-12">
                    <span className="section-kicker mb-4">
                        <Workflow size={12} />
                        Metodología
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                        {cfg.title}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base mt-2">
                        Acompañamos cada proyecto de principio a fin para asegurar resultados impecables.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {activeSteps.map((step, i) => (
                        <StepCard key={step.label + i} step={step} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
