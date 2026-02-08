import { auth, db } from "@/config/firebase";
import { Restaurant } from "@/utils/types";
import { toSlug } from "@/utils/slug";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

const restaurantsCol = () => collection(db, "restaurants");

export const createRestaurant = async (data: {
  name: string;
  phone?: string;
  city?: string;
  colors?: { primary?: string; secondary?: string; accent?: string };
  logo?: string;
}): Promise<Restaurant> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const id = user.uid;
  const restaurant: Restaurant = {
    id,
    ownerId: id,
    name: data.name,
    logo: data.logo ?? null,
    colors: data.colors ?? null,
    phone: data.phone ?? null,
    city: data.city ?? null,
    slug: toSlug(data.name),
    createdAt: Date.now(),
  };
  await setDoc(doc(restaurantsCol(), id), restaurant);
  return restaurant;
};

export const updateRestaurant = async (
  id: string,
  data: Partial<Restaurant>
): Promise<void> => {
  await setDoc(doc(restaurantsCol(), id), data, { merge: true });
};

export const getRestaurantByOwner = async (
  ownerId: string
): Promise<Restaurant | null> => {
  try {
    const snap = await getDoc(doc(restaurantsCol(), ownerId));
    return snap.exists() ? (snap.data() as Restaurant) : null;
  } catch {
    return null;
  }
};

export const getRestaurantBySlug = async (
  slug: string
): Promise<Restaurant | null> => {
  try {
    const q = query(restaurantsCol(), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Restaurant;
  } catch {
    return null;
  }
};


