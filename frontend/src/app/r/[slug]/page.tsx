"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { getRestaurantBySlug } from "@/services/restaurants";
import { listProductsByRestaurant } from "@/services/products";
import { createOrder } from "@/services/orders";
import { Restaurant, Product, OrderItem } from "@/utils/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function PublicMenuPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const r = await getRestaurantBySlug(slug);
      if (!r) return;
      setRestaurant(r);
      const p = await listProductsByRestaurant(r.id, true);
      setProducts(p);
    };
    run();
  }, [slug]);

  const total = useMemo(() => {
    return products.reduce((sum, p) => sum + (items[p.id] || 0) * p.price, 0);
  }, [products, items]);

  const addItem = (id: string) =>
    setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeItem = (id: string) =>
    setItems((prev) => {
      const qty = (prev[id] || 0) - 1;
      const next = { ...prev, [id]: Math.max(0, qty) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  const onSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    const orderItems: OrderItem[] = products
      .filter((p) => items[p.id] && items[p.id] > 0)
      .map((p) => ({
        productId: p.id,
        quantity: items[p.id],
        price: p.price,
        name: p.name,
      }));
    if (orderItems.length === 0) {
      setStatusMsg("Sélectionnez au moins un produit");
      return;
    }
    const id = await createOrder({
      restaurantId: restaurant.id,
      items: orderItems,
      customerName,
      customerPhone,
    });
    setStatusMsg(`Commande créée #${id}`);
    setItems({});
    setCustomerName("");
    setCustomerPhone("");
  };

  if (!restaurant) {
    return <div className="p-8">Chargement du menu...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold">{restaurant.name}</h1>
        <div className="text-sm text-gray-600">Sélectionnez vos produits</div>
      </div>
      <div className="grid gap-3 mb-6">
        {products.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.category || "Sans catégorie"} • {p.price.toFixed(2)} €</div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => removeItem(p.id)}>-</Button>
              <span>{items[p.id] || 0}</span>
              <Button variant="primary" onClick={() => addItem(p.id)}>+</Button>
            </div>
          </Card>
        ))}
      </div>
      <form onSubmit={onSubmitOrder} className="space-y-3">
        <Card className="space-y-3">
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{total.toFixed(2)} €</span>
        </div>
        <Input placeholder="Nom client" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} />
        <Input placeholder="Téléphone" value={customerPhone} onChange={(e)=>setCustomerPhone(e.target.value)} />
        <Button variant="primary">Valider la commande</Button>
        {statusMsg && <p className="text-sm text-gray-700">{statusMsg}</p>}
        </Card>
      </form>
    </div>
  );
}
