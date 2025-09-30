import { Texts } from "@context/TextContext";

export interface SubMenuItem {
  label: string;
  href: string;
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
      label: texts.menu.services,
      subItems: [
        { label: texts.menu.servicesSub.portraits, href: "/services/portraits" },
        { label: texts.menu.servicesSub.school, href: "/services/school" },
        { label: texts.menu.servicesSub.home, href: "/services/home" },
        { label: texts.menu.servicesSub.weddings, href: "/services/weddings" },
      ],
    },
    { label: texts.menu.reservation, href: "/order" },
    {
      label: texts.menu.gallery,
      subItems: [
        { label: texts.menu.gallerySub.children, href: "/gallery/children" },
        { label: texts.menu.gallerySub.school, href: "/gallery/school" },
        { label: texts.menu.gallerySub.weddings, href: "/gallery/weddings" },
      ],
    },
    { label: texts.menu.customerZone, href: "/login" },
  ];
};
