import { Texts } from "@context/TextContext";
import { getActiveWeddingPackages, PhotoshootPackage } from "@lib/api";
import {
  LucideIcon,
  Gem,
  Images,
  UserRoundPen,
  Baby,
  House,
  Heart,
} from "lucide-react";

export interface SubMenuItem {
  label?: string;
  href?: string;
  description?: string;
  image?: string;
  icon?: LucideIcon;
  button?: {
    label?: string;
    href: string;
  };
  dynamicPackages?: boolean; // custom flag for dynamic wedding packages
  packages?: {
    label: string;
    href: string;
  }[]; // list of dynamically loaded packages
}

export interface MenuItem {
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
  onClick?: () => void; // click handler (logout)
}

/**
 * Returns guest menu items
 */
export const createMenuItems = (texts: Texts): MenuItem[] => {
  return [
    {
      label: texts.menu.servicesSub.portraits,
      subItems: [
        {
          icon: Baby,
          label: texts.menu.servicesSub.portraits_kids,
          href: "/services/portraits-kids",
        },
        {
          icon: House,
          label: texts.menu.servicesSub.home,
          href: "/services/home",
        },
      ],
    },
    {
      label:
        texts.menu.servicesSub.school +
        " & " +
        texts.menu.servicesSub.kindergarten,
      subItems: [
        {
          icon: UserRoundPen,
          label: texts.menu.servicesSub.school,
          description: "Pre viac informácií nás kontaktujte",
          href: "/service/reservation",
          button: {
            label: texts.menu.order,
            href: "/service/reservation",
          },
        },
        {
          icon: UserRoundPen,
          label: texts.menu.servicesSub.kindergarten,
          description: "Pre viac informácií nás kontaktujte",
          href: "/service/reservation",
          button: {
            label: texts.menu.order,
            href: "/service/reservation",
          },
        },
        {
          icon: Images,
          label: texts.menu.gallery,
          href: "/gallery/kids",
          description: "Pozrite si fotogalériu",
        },
      ],
    },
    {
      label: texts.menu.servicesSub.weddings,
      subItems: [
        {
          icon: Gem,
          label: texts.menu.services_details_wed,
          description:
            "Explore wedding photography packages tailored for your big day.",
        },
        {
          icon: Images,
          label: texts.menu.gallery,
          href: "/gallery/weddings",
          description: "Pozrite si svadobnú galériu",
        },
        {
          icon: Heart,
          label: texts.common?.availabledPackages,
          button: {
            label: texts.common?.moreInfo,
            href: "/service/weddings",
          },
          dynamicPackages: true, // custom flag to identify this submenu
        },
      ],
    },
    {
      label: texts.menu.gallery,
      href: "/gallery",
      subItems: [
        { label: texts.menu.gallerySub.school, href: "/gallery/school" },
        { label: texts.menu.gallerySub.weddings, href: "/gallery/weddings" },
      ],
    },
    {
      label: texts.menu.order,
      subItems: [
        {
          label: texts.menu.nextAvailableDate,
          href: "/reserve",
          description:
            texts.menu.servicesSub.kids +
            "date taken from DB" +
            texts.menu.servicesSub.portraits +
            "date taken from DB",
        },
      ],
    },
    {
      label: texts.menu.customerZone,
      href: "/login",
    },
  ];
};
