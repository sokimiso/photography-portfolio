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
  Blocks,
} from "lucide-react";

export interface SubMenuItem {
  label?: string;
  id?: string;
  href?: string;
  description?: string;
  image?: string;
  icon?: LucideIcon;
  button?: {
    label?: string;
    href: string;
  };
  dynamicPackages?: boolean;
  packages?: {
    label: string;
    href?: string;
  }[];

  dynamicFeatured?: boolean; // custom flag for dynamically loaded featured photos
  featuredCategory?: string; // which category to load from (e.g. "event-wedding")
  featuredPhotos?: {
    thumbnailUrl: string;
    id: string;
  }[];
}

export interface MenuItem {
  label: string;
  href?: string;
  id?: string;
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
      href: "/services/portraits-kids",
      id: "kids",
      subItems: [
        {
          icon: Baby,
          label: texts.menu.servicesSub.portraits_kids,
          href: "/services/portraits-kids",
        },
        {
          icon: House,
          label: texts.menu.servicesSub.home,
          href: "/services/portraits-kids",
        },
        {
          icon: Blocks,
          label: texts.common?.availabledPackages,
          href: "/services/portraits-kids",
          button: {
            label: texts.common?.moreInfo,
            href: "/service/portraits-kids",
          },
          dynamicPackages: true, // custom flag to identify this submenu
        },
      ],
    },
    {
      label: texts.menu.servicesSub.kids,
      id: "school",
      subItems: [
        {
          icon: UserRoundPen,
          label: texts.menu.servicesSub.kids,
          description: "Pre viac informácií nás kontaktujte",
          button: {
            label: texts.menu.order,
            href: "/service/reservation",
          },
        },
        {
          icon: Images,
          label: texts.menu.gallery,
          href: "/gallery",
          description: "Pozrite si fotogalériu",
        },
        {
          icon: Blocks,
          label: texts.common?.availabledPackages,
          id: "wedding",
          button: {
            label: texts.common?.moreInfo,
            href: "/service/school",
          },
          dynamicPackages: true, // custom flag to identify this submenu
        },
      ],
    },
    {
      label: texts.menu.servicesSub.weddings,
      id: "wedding",
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
          href: "/gallery",
          description: "Pozrite si svadobnú galériu",
          dynamicFeatured: true,
          featuredCategory: "event-wedding",
        },
        {
          icon: Blocks,
          label: texts.common?.availabledPackages,
          button: {
            label: texts.common?.moreInfo,
            href: "/service/weddings",
          },
          dynamicPackages: true,
        },
      ],
    },
    {
      label: texts.menu.gallery,
      href: "/gallery",
    },
    {
      label: texts.menu.order,
      href: "/service/reservation",
    },
    {
      label: texts.menu.customerZone,
      href: "/login",
    },
  ];
};
