import GalleryPageComponent from "@/app/(site)/gallery/GalleryPageComponent";
import Footer from "@/components/layout/Footer";

export default function GalleryPage() {
  return (
    <main className="bg-background-light dark:bg-background-dark text-foreground py-7">
      <section id="hero">
        <GalleryPageComponent />
      </section>

      <Footer />
    </main>
  );
}
