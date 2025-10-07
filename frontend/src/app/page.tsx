import HeroSection from "@/components/hero/HeroSection";
import AboutMeSection from "@/components/about/AboutMeSection";
import GalleryPreview from "@/components/gallery/GalleryPreview";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="bg-background-light dark:bg-background-dark text-foreground">
      <HeroSection />
      <AboutMeSection />
      <GalleryPreview />
      <Footer />
    </main>
  );
}
