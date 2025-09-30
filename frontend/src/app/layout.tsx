import "@styles/globals.css";
import { ReactNode } from "react";
import Navbar from "@layout/Navbar";
import { AuthProvider } from "@context/AuthContext";
import { ToastProviderWrapper } from "@/components/ui/use-toast";

interface RootLayoutProps {
  children: ReactNode;
}


export const metadata = {
  title: 'Fotograf Presov, Kosice',
  description: "Fotograf východ pre vašu svadbu, škôlku, školu a portréty detí.",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="sk">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <AuthProvider>
          <ToastProviderWrapper>
            <Navbar />
            <main>{children}</main>
          </ToastProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}