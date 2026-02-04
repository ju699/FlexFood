"use client";
"use client";
export const dynamic = "force-dynamic";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { createRestaurant, getRestaurantByOwner } from "@/services/restaurants";
import { createProduct, deleteProduct, listProductsByRestaurant, updateProduct } from "@/services/products";
import { Restaurant, Product } from "@/utils/types";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, loading } = useProtectedRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const r = await getRestaurantByOwner(user.uid);
      setRestaurant(r);
      if (r) {
        const p = await listProductsByRestaurant(r.id);
        setProducts(p);
      }
    };
    if (!loading) run();
  }, [user, loading]);

  const onCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await createRestaurant({ name, city, phone });
    setRestaurant(r);
  };

  const onAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const nameP = String(fd.get("name") || "");
    const price = Number(fd.get("price") || 0);
    const category = String(fd.get("category") || "");
    const id = await createProduct({
      restaurantId: restaurant.id,
      name: nameP,
      price,
      category,
      isAvailable: true,
    });
    setProducts((prev) => [
      ...prev,
      { id, restaurantId: restaurant.id, name: nameP, price, category, isAvailable: true },
    ]);
    form.reset();
  };

  const toggleAvailability = async (p: Product) => {
    await updateProduct(p.id, { isAvailable: !p.isAvailable });
    setProducts((prev) =>
      prev.map((it) => (it.id === p.id ? { ...it, isAvailable: !it.isAvailable } : it))
    );
  };

  const removeProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      {!restaurant ? (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Créer votre restaurant</h2>
          <form onSubmit={onCreateRestaurant} className="space-y-3">
            <Input placeholder="Nom" value={name} onChange={(e)=>setName(e.target.value)} required />
            <Input placeholder="Ville" value={city} onChange={(e)=>setCity(e.target.value)} />
            <Input placeholder="Téléphone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <Button variant="primary">Créer</Button>
          </form>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold">{restaurant.name}</h2>
            <p className="text-sm text-gray-600">URL publique: /r/{restaurant.slug}</p>
          </Card>

          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Ajouter un produit</h3>
            <form onSubmit={onAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input name="name" placeholder="Nom" required />
              <Input name="price" type="number" step="0.01" placeholder="Prix" required />
              <Input name="category" placeholder="Catégorie" />
              <Button variant="primary">Ajouter</Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-3">Produits</h3>
            <ul className="space-y-2">
              {products.map((p) => (
                <li key={p.id} className="flex items-center justify-between border rounded px-3 py-2">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.category || "Sans catégorie"} • {p.price.toFixed(2)} €</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => toggleAvailability(p)}>
                      {p.isAvailable ? "Désactiver" : "Activer"}
                    </Button>
                    <Button className="text-red-600" onClick={() => removeProduct(p.id)}>Supprimer</Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
