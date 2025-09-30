"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";

export interface Texts {
  menu: {
    services: string;
    reservation: string;
    gallery: string;
    customerZone: string;
    servicesSub: Record<string, string>;
    gallerySub: Record<string, string>;
  };
  homepage?: {
    heroTitle?: string;
    heroSubtitle?: string;
  };
}

const defaultTexts: Texts = {
  menu: {
    services: "Služby",
    reservation: "Rezervácia",
    gallery: "Galéria",
    customerZone: "Prihlásiť sa",
    servicesSub: {
      portraits: "Portréty detí",
      school: "Škola - Škôlka",
      home: "Fotografovanie u vás doma",
      weddings: "Svadby",
    },
    gallerySub: {
      children: "Deti",
      school: "Škola - Škôlka",
      weddings: "Svadby",
    },
  },
};

interface TextContextProps {
  texts: Texts;
  setTexts: (newTexts: Partial<Texts>) => void;
}

const TextContext = createContext<TextContextProps>({
  texts: defaultTexts,
  setTexts: () => {},
});

export const TextProvider = ({ children }: { children: ReactNode }) => {
  const [texts, setTextsState] = useState<Texts>(defaultTexts);

  const setTexts = (newTexts: Partial<Texts>) => {
    setTextsState((prev) => ({ ...prev, ...newTexts }));
  };

  useEffect(() => {
    async function fetchTexts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/texts`);
        if (res.ok) {
          const data: Partial<Texts> = await res.json();
          setTexts(data);
        }
      } catch (error) {
        console.warn("Could not fetch dynamic texts", error);
      }
    }

    fetchTexts();
  }, []);

  return (
    <TextContext.Provider value={{ texts, setTexts }}>
      {children}
    </TextContext.Provider>
  );
};

export const useTexts = () => useContext(TextContext).texts;
export const useSetTexts = () => useContext(TextContext).setTexts;
