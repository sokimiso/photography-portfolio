"use client";

export default function Footer() {
  return (
    <footer className="bg-background-light dark:bg-background-dark py-10 px-4 sm:px-6 lg:px-8 text-center text-foreground/70">
      <p>&copy; 2010 - {new Date().getFullYear()} Michal Sokirka. Všetky práva vyhradené.</p>
    </footer>
  );
}
