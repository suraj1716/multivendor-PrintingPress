import { Config } from "ziggy-js";




export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  stripe_account_active: boolean;
  vendor: {
    status: string;
    status_label: string;
    store_name: string;
    store_address: string;
    vendor_type: string;
    cover_image: string;
  };
}

export type VariationTypeOption = {
  id: number;
  name: string;
  images: Image[];
  type: VariationType;
};
export type VariationType = {
  id: number;
  name: string;
  type: "Select" | "Radio" | "Image";
  options: VariationTypeOption[];
};

export type Product = {
  id: number;
  title: string;
  slug: string;
  price: number;
  image: string;
  images: Image[];
  description: string;
  short_description: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  category_id: number;
  category: {
    id: number;
    name: string;
    created_at: string;
    products_count?: number;
  };
  quantity: number;
  user: {
    id: number;
    name: string;
    store_name: string;
  };
  department: {
    id: number;
    name: string;
    slug: string;
  };

  variationTypes: VariationType[];
  variations: Array<{
    id: number;
    variation_type_option_ids: number[];
    quantity: number;
    price: number;
  }>;
};

export type Image = {
  id: number;
  thumb: string;
  small: string;
  large: string;
};


export interface Booking {
  booking_date: string;
  time_slot: string;
  notes: string;
}
export type CartItem = {
  id: number;
  product_id: number;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  image_url: string;
  option_ids: Record<string, number>;
  options: VariationTypeOption[];
  attachment_path: string,
   attachment_name: string,
   booking: Booking[] | null; // Nullable booking field

};

export type GroupedCartItems = {
  user: User;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
};

export type PaginationProps<T> = {
  data: T[];

  // object with first / last / prev / next (rarely used for page buttons)
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };

  // meta holds the array you normally loop over
  meta: {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
    path: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
};


export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = T & {
  appName: string;
  csrf_token: string;
  error: string;
  success: {
    message: string;
    time: number;
  };
  auth: {
    user: User;
  };
  ziggy: Config & { location: string };
  totalQuantity: number;
  totalPrice: number;
  miniCartItems: CartItem[];
  departments: Department[];
  dpts: Department[];
};
export type VariationSummary = {
  type: string;
  option: string;
   image:string
};

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    title: string;
    image?: string;
    variationTypes: {
      id: number;
      name: string;
      options: { id: number; name: string }[];
    }[];
  };
  variation_type_option_ids: number[];
  variation_summary?: VariationSummary[]; // ✅ Add this line
   attachment_path?: string;    // <-- add here
  attachment_name?: string;
  booking?: Booking;
};

export type Order = {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  vendor: {
    id: string;
    name: string;
    email: string;
    store_name: string;
    store_address: string;
    vendor_type: string;
  };

  orderItems: OrderItem[];
};

export type Vendor = {
  id: number;
  store_name: string;
  store_address: string;
  vendor_type: string;
};

export type Category = {
  id: number;
  name: string;
  products_count: number;
};

export type Department = {
  id: number;
  name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  categories: Category[];
  productsCount: number;
};

export type dpts = {
  id: number;
  name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  categories: Category[];
  productsCount: number;
};

export type ProductListItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  slug: string;
  user: {
    id: number;
    name: string;
    store_name: string;
  };
  department: {
    id: number;
    name: string;
    slug: string;
  };
};
