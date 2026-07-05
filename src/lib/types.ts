interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  originalPrice?: number;
  img: string;
  category: string;
  featured?: boolean;
}

interface CartItem extends Product {
  qty: number;
}

interface Category {
  name: string;
  products: Product[];
  isFeatured?: boolean;
}