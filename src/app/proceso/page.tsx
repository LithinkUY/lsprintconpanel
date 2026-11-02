import Footer from "@/components/Footer";
import ProcessSection from "@/components/ProcessSection";
import Link from "next/link";

export const metadata = {
    title: "Proceso de Pedidos",
    description: "Conocé cómo funciona nuestro proceso de pedidos, desde la idea hasta la entrega.",
};

export default function ProcesoPedidosPage() {
    return (
        <main className="min-h-screen bg-[#07090f] flex flex-col">
            <div className="pt-32 pb-16 px-6 text-center border-b border-white/[0.06] studio-grid-bg">
                <span className="section-kicker mb-4">Cómo trabajamos</span>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
                    Proceso de <span className="brand-gradient-text">Pedidos</span>
                </h1>
                <p className="text-slate-400 text-base max-w-xl mx-auto">
                    Desde que nos contactás hasta que recibís tu producto, te acompañamos en cada etapa.
                </p>
            </div>

            <ProcessSection showAlways />

            <div className="py-20 px-6 text-center">
                <p className="text-slate-400 text-sm mb-6">¿Listo para comenzar tu proyecto?</p>
                <Link
                    href="/pedido"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#00CFFF] text-[#05080f] font-black uppercase tracking-wider text-sm hover:bg-[#33d9ff] transition-all shadow-[0_0_24px_rgba(0,207,255,0.28)]"
                >
                    Hacé tu pedido →
                </Link>
            </div>

            <Footer />
        </main>
    );
}
