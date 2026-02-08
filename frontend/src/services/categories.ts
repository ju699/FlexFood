import { db } from "@/config/firebase";
import { Category } from "@/utils/types";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

const categoriesCol = () => collection(db, "categories");

export const createCategory = async (
  data: Omit<Category, "id">
): Promise<string> => {
  const ref = await addDoc(categoriesCol(), data);
  return ref.id;
};

export const updateCategory = async (
  id: string,
  data: Partial<Category>
): Promise<void> => {
  await updateDoc(doc(categoriesCol(), id), data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(categoriesCol(), id));
};

export const listCategoriesByRestaurant = async (
  restaurantId: string
): Promise<Category[]> => {
  const q = query(categoriesCol(), where("restaurantId", "==", restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }));
};
