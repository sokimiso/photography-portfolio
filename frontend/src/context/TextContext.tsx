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
    cta?: string;
  };
  dashboard?: {
    sidebar: {
      dashboard: string;
      orders: string;
      users: string;
      photos: string;
      notifications: string;
      analytics: string;
      manageWeb: string;
      logout: string;
    };
    ordersPage?: {
      createOrderButton: string;
      manageOrderButton: string;
      pendingOrdersTitle: string;
      confirmedOrdersTitle: string;
      noOrdersMessage: string;
      orders?: {
        order: string;
        orders: string;
        confirmed: string;
        pending: string;
        cancelled: string;
        deleted: string;
        noOrders: string;
        orderNumber: string;
        client: string;
        package: string;
        shootDate: string;
        shootPlace: string;
        shootTime: string;
        balance: string;
        finalPrice: string;
        status: string;
        notes: string;
      };
    };
    eventsPage?: {
      nextEvent: string;
      nextEvents: string;
      thisWeeksEvents: string;
      nextWeeksEvents: string;
      overdueEvents: string;
      events?: {
        nextEvent: string;
        nextEvents: string;
        thisWeeksEvents: string;
        nextWeeksEvents: string;
        overdueEvents: string;
      },      
    };
    notificationsPage?: {
      noNotificationsMessage: string;
    };
  };
  about?: {
    heading: string;
    description: string;
  };
  buttons: {
    edit: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    reserve: string;
    close: string;
    create: string;
    manage: string;
    show: string;
  };
  common?:{
    name: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
    package: string;
  };
  footer?: {
    text: string;
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
  homepage: {
    heroTitle: "Zachyťte výnimočné momenty",
    heroSubtitle: "Profesionálny fotograf pre deti, školy, svadby a iné udalosti.",
    cta: "Rezervácia",
  },
  dashboard: {
    sidebar: {
      dashboard: "Dashboard",
      orders: "Objednávky",
      users: "Užívatelia",
      photos: "Fotky",
      notifications: "Notifikácie",
      analytics: "Analytics",
      manageWeb: "Správa webu",
      logout: "Odhlásiť sa",
    },
    ordersPage: {
      createOrderButton: "Vytvoriť objednávku",
      manageOrderButton: "Spravovať objednávku",
      pendingOrdersTitle: "Objednávky čakajúce na schválenie",
      confirmedOrdersTitle: "Potvrdené objednávky",
      noOrdersMessage: "Žiadne objednávky",
      orders: {
        order: "Objednávka",
        orders: "Objednávky",
        confirmed: "Potvrdené",
        pending: "Čakajúce",
        cancelled: "Zrušené",
        deleted: "Vymazané",
        noOrders: "Žiadne objednávky",
        orderNumber: "Číslo obj.",
        client: "Zákazník",
        package: "Balík",
        shootDate: "Termín fotenia",
        shootPlace: "Miesto fotenia",
        shootTime: "Čas fotenia",
        balance: "Suma",
        finalPrice: "Konečná cena",
        status: "Stav objednávky",
        notes: "Poznámky",
      },
    },
    eventsPage: {
      nextEvent: "Najbližšia udalosť",
      nextEvents: "Najbližšie udalosti",
      thisWeeksEvents: "Udalosti tento týždeň",
      nextWeeksEvents: "Udalosti budúci týždeň",
      overdueEvents: "Zmeškané udalosti",
      events: {
        nextEvent: "Najbližia udalosť",
        nextEvents: "Najbližie udalosti",
        thisWeeksEvents: "Udalosti tento týždeň",
        nextWeeksEvents: "Udalosti budúci týždeň",
        overdueEvents: "Zmeškané udalosti",
      },

    },
    notificationsPage: {
      noNotificationsMessage: "Žiadne notifikácie",
    },
  },
  about: {
    heading: "O mne",
    description:
      "Volám sa Michal Sokirka a som profesionálny fotograf zameraný na portréty detí, školské akcie a svadby. Snažím sa zachytiť jedinečné momenty a spomienky, ktoré vydržia celý život.",
  },
  buttons: {
    edit: "Upraviť",
    save: "Uložiť",
    cancel: "Zrušiť",
    confirm: "Potvrdiť",
    delete: "Zmazať",
    reserve: "Rezervovať",
    close: "Zatvoriť",
    create: "Vytvoriť",
    manage: "Spravovať",
    show: "Zobraziť",
  },
  common: {
    name: "Meno",
    lastName: "Priezvisko",
    email: "Email",
    address: "Adresa",
    phone: "Telefón",
    package: "Balíček",
  },  
  footer: {
    text: "© 2025 Sokirka Photography. Všetky práva vyhradené.",
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




