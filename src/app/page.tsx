import Footer from "@/components/Footer";
import HomeLayout from "@/components/HomeLayout";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col bg-[#07090f]">
            <HomeLayout />
            <Footer />
        </main>
    );
}
