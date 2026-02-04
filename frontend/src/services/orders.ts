import { db } from "@/config/firebase";
import { Order, OrderItem } from "@/utils/types";
import { addDoc, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

const ordersCol = () => collection(db, "orders");

const genOrderNumber = () => {
  const ts = new Date();
  const y = ts.getFullYear().toString().slice(-2);
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${y}${m}${d}-${rand}`;
};

export const createOrder = async (data: {
  restaurantId: string;
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string | null;
}): Promise<string> => {
  const order: Omit<Order, "id"> = {
    restaurantId: data.restaurantId,
    items: data.items,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    tableNumber: data.tableNumber ?? null,
    status: "pending",
    orderNumber: genOrderNumber(),
    createdAt: Date.now(),
  };
  const ref = await addDoc(ordersCol(), order);
  return ref.id;
};

export const listOrdersByRestaurant = async (
  restaurantId: string
): Promise<Order[]> => {
  const q = query(ordersCol(), where("restaurantId", "==", restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"]
): Promise<void> => {
  await updateDoc(doc(ordersCol(), id), { status });
};
