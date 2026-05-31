export enum ProductCategory {
  WATER_PURIFIER = 'Water Purifier',
  AIR_PURIFIER = 'Air Purifier',
  VACUUM_CLEANER = 'Vacuum Cleaner',
  WATER_SOFTENER = 'Water Softener',
}

export enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_LOW = 'price-low',
  PRICE_HIGH = 'price-high',
}

export enum PriceBracket {
  UNDER_10K = '0-10000',
  BETWEEN_10K_15K = '10000-15000',
  BETWEEN_15K_20K = '15000-20000',
  ABOVE_20K = '20000+',
}

export enum WaterTech {
  RO = 'ro',
  UV = 'uv',
  UF = 'uf',
}

export enum Placement {
  WALL_MOUNTED = 'wall-mounted',
  UNDER_COUNTER = 'under-counter',
  TABLE_TOP = 'table-top',
}

export enum Capacity {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum VacType {
  CANISTER = 'canister',
  HANDHELD = 'handheld',
  UPRIGHT = 'upright',
  ROBOTIC = 'robotic',
  STICK = 'stick',
}

export enum VacApp {
  DRY = 'dry',
  WET_DRY = 'wet-dry',
}

export enum VacDust {
  BAGLESS = 'bagless',
  BAGGED = 'bagged',
  CYCLONIC = 'cyclonic',
}

export enum VacPow {
  CORDED = 'corded',
  CORDLESS = 'cordless',
  BATTERY = 'battery',
}

export type ProductSubcategory = WaterTech | Placement | Capacity | VacType | VacApp | VacDust | VacPow | string;

export interface Product {
  sku: string;
  name: string;
  category: ProductCategory | string;
  i18nTag: string;
  subcategories: ProductSubcategory[];
  outOfStock: boolean;
  leaflet: string;
  image: string;
  description: string;
  mrp: number;
  mop: number;
  specs?: Record<string, any>;
  schema?: Record<string, any>;
  highlights?: string[];
}
