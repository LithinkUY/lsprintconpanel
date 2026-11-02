import { sql } from "@/lib/db";
import { Page } from "@/lib/types";
import { notFound } from "next/navigation";
import { mockPages } from "@/lib/mock-data";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let pages: Page[] = [];
    try {
        const rows = await sql`SELECT value FROM site_config WHERE key='pages'`;
        pages = rows[0]?.value ?? mockPages;
    } catch {
        pages = mockPages;
    }

    const page = pages.find((p: Page) => p.slug === slug && p.active);

    if (!page && slug !== "contacto") {
        return {
            title: "Página no encontrada",
        };
    }

    return {
        title: page ? page.title : "Contacto",
    };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let pages: Page[] = [];
    let hasCustomDbPages = false;
    try {
        const rows = await sql`SELECT value FROM site_config WHERE key='pages'`;
        if (rows[0]?.value) {
            pages = rows[0].value as Page[];
            hasCustomDbPages = true;
        } else {
            pages = mockPages;
        }
    } catch {
        pages = mockPages;
    }

    const page = pages.find((p: Page) => p.slug === slug && p.active);

    if (!page && slug !== "contacto") {
        notFound();
    }

    // Si es /contacto y no hay contenido personalizado creado en DB, mostramos directamente ContactSection con diseño limpio
    if (slug === "contacto" && !hasCustomDbPages) {
        return (
            <main className="min-h-screen flex flex-col bg-[#07090f]">
                <div className="flex-1 pt-20">
                    <ContactSection />
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-[#07090f]">
            <div className="flex-1 pt-32 pb-20">
                {page && (
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="bg-[#0d121c] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight uppercase">
                                {page.title}
                            </h1>
                            <div
                                className="text-slate-300 space-y-4 leading-relaxed [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>a]:text-[#00CFFF] [&>a]:underline [&>strong]:text-white"
                                dangerouslySetInnerHTML={{ __html: page.content }}
                            />
                        </div>
                    </div>
                )}
                {slug === "contacto" && <ContactSection />}
            </div>
            <Footer />
        </main>
    );
}
