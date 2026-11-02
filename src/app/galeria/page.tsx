import { sql } from "@/lib/db";
import { GalleryConfig } from "@/lib/types";
import { mockGallery } from "@/lib/mock-data";
import Footer from "@/components/Footer";
import GalleryView from "@/components/GalleryView";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Galería de Trabajos",
    description: "Explorá nuestra galería de trabajos realizados en impresión de gran formato, corte láser, sublimación y más.",
};

export default async function GalleryPage() {
    let gallery: GalleryConfig = mockGallery;

    try {
        const rows = await sql`SELECT value FROM site_config WHERE key='gallery'`;
        if (rows.length > 0 && rows[0].value) {
            gallery = rows[0].value as GalleryConfig;
        }
    } catch {
        gallery = mockGallery;
    }

    return (
        <main className="min-h-screen flex flex-col bg-[#07090f]">
            <div className="flex-1 pt-24">
                <GalleryView config={gallery} />
            </div>
            <Footer />
        </main>
    );
}
