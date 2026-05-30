export interface Product {
  sku: string;
  name: string;
  category: string;
  i18nTag: string;
  subcategories: string[];
  outOfStock: boolean;
  leaflet: string;
  image: string;
  description: string;
  mrp: number;
  mop: number;
  specs?: Record<string, any>;
}
