import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    stripe_account_active:boolean;
    vendor:{
      status:string,
      status_label:string,
      store_name:string,
      store_address:string,
      cover_image:string
    }
}



export type VariationTypeOption = {
id: number;
    name: string;
    images: Image[];
    type:VariationType
}
export type VariationType = {
    id: number;
    name: string;
    type:'Select' | 'Radio' | 'Image';
    options: VariationTypeOption[]
}

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
    }
    quantity: number;
    user : {
        id: number;
        name: string;
        store_name:string;
    }
    department: {
        id: number;
        name: string;
        slug:string
    },

    variationTypes:VariationType[],
    variations:Array<{
        id: number;
        variation_type_option_ids: number[];
        quantity: number;
        price: number;
    }>
  }



  export type Image={
    id: number;
   thumb: string;
    small: string;
    large: string;
  }

  export type CartItem = {
    id: number;
    product_id: number;
   title: string;
   slug: string;
   price: number;
    quantity: number;
    image_url: string;
    option_ids:Record<string, number>;
    options:VariationTypeOption[];
  }
export type PaginationProps<T> = {
  data: T[];

  // object with first / last / prev / next (rarely used for page buttons)
  links: {
    first: string | null;
    last : string | null;
    prev : string | null;
    next : string | null;
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


export type GroupedCartItems = {
    user:User;
    items:CartItem[];
    totalPrice: number;
    totalQuantity: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  appName:string,
  csrf_token: string;
  error:string,
  success:{
message:string;
time:number
  },
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
    totalQuantity: number;
    totalPrice: number;
    miniCartItems: CartItem[];
    departments:Department[]
};

export type OrderItem={
  id:number,
  quantity:number,
  price:number,
  variation_type_option_ids:number[],
product:{
  id:number,
  title:string,
  slug:string,
  description:string
  image:string
}
}

export type Order={
  id:number,
  total_price:number,
  status:string,
  created_at:string
  vendorUser:{
    id:string,
    name:string,
    email:string,
    store_name:string,
    store_address:string
  }

  orderItems:OrderItem[]
}



export type Vendor={
  id:number;
  store_name:string;
  store_address:string;
}



export type Category={
  id:number,
  name:string
}

export type Department={
  id:number,
  name:string,
  slug:string,
  meta_title:string,
  meta_description:string,
  categories:Category[]
}
