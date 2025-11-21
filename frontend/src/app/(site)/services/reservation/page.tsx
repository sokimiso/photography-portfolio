import ReservationPageComponent from "./ReservationPageComponent";
import Footer from "@/components/layout/Footer";

export default function ServicesPage() {
  return (
    <main className="bg-background-light dark:bg-background-dark text-foreground py-7">
      <section id="hero">
        <ReservationPageComponent />
      </section>

      <Footer />
    </main>
  );
}
