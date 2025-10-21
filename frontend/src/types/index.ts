export type Tag = {
  id: string;
  name: string;
};

export type Photo = {
  id: string;
  title: string;
  url: string;
  tags?: Tag[];
  isVisible?: boolean;
};
