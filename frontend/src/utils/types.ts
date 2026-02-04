export type Restaurant = {
  id: string;
  ownerId: string;
  name: string;
  logo?: string | null;
  colors?: { primary?: string; secondary?: string; accent?: string } | null;
  phone?: string | null;
  city?: string | null;
  slug: string;
  createdAt: number;
};

export type Product = {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  image?: string | null;
  category?: string | null;
  isAvailable: boolean;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
};

export type Order = {
  id: string;
  restaurantId: string;
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string | null;
  status: "pending" | "preparing" | "ready" | "served";
  orderNumber: string;
  createdAt: number;
};
