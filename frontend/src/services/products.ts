import { db } from "@/config/firebase";
import { Product } from "@/utils/types";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

const productsCol = () => collection(db, "products");

export const createProduct = async (
  data: Omit<Product, "id">
): Promise<string> => {
  const ref = await addDoc(productsCol(), data);
  return ref.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Product>
): Promise<void> => {
  await updateDoc(doc(productsCol(), id), data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(productsCol(), id));
};

export const listProductsByRestaurant = async (
  restaurantId: string,
  onlyAvailable = false
): Promise<Product[]> => {
  const q = query(
    productsCol(),
    where("restaurantId", "==", restaurantId),
    ...(onlyAvailable ? [where("isAvailable", "==", true)] : [])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const snap = await getDoc(doc(productsCol(), id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Product, "id">) }) : null;
};
