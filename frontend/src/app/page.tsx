import HeroSection from "@/components/hero/HeroSection";
import AboutMeSection from "@/components/about/AboutMeSection";
import GalleryPreview from "@/components/gallery/GalleryPreview";
import Reservation from "@/components/reservation/ReservationSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="bg-background-light dark:bg-background-dark text-foreground">
      <section id="hero">
        <HeroSection />
      </section>

      <section id="about">
        <AboutMeSection />
      </section>

      <section id="gallery">
        <GalleryPreview />
      </section>

      <section id="reservation">
        <Reservation />
      </section>      

      <Footer />
    </main>
  );
}
