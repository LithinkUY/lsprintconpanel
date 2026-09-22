import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSlider from "@/components/ServicesSlider";
import ProcessSection from "@/components/ProcessSection";
import ClientsSlider from "@/components/ClientsSlider";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main>
            <Header />
            <HeroSection />
            <ClientsSlider />
            <AboutSection />
            <ProcessSection />
            <ServicesSlider />
            <ContactSection />
            <Footer />
        </main>
    );
}
