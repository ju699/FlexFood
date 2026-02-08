export type OpeningHours = {
  [key in "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"]?: {
    open: string;
    close: string;
    closed: boolean;
  };
};

export type Restaurant = {
  id: string;
  ownerId: string;
  name: string;
  logo?: string | null;
  coverImage?: string | null;
  colors?: { primary?: string; secondary?: string; accent?: string } | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  slug: string;
  openingHours?: OpeningHours | null;
  createdAt: number;
};

export type Category = {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: number;
};

export type Product = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string | null; // This might be the category ID or Name. Let's assume Name for now as per previous code, or ID if we strictly link. The previous code used a string input for category. I will stick to string for now but ideally it should be ID. However, to not break existing, I'll keep it compatible or check usage.
  categoryId?: string | null; // Adding this for proper relation
  cookingTime?: number | null; // in minutes
  tags?: string[];
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
