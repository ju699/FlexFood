"use client";
export const dynamic = "force-dynamic";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { listOrdersByRestaurant, updateOrderStatus } from "@/services/orders";
import { Order } from "@/utils/types";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function OrdersPage() {
  const { user, loading } = useProtectedRoute();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const data = await listOrdersByRestaurant(user.uid);
      setOrders(data);
    };
    if (!loading) run();
  }, [user, loading]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Commandes</h1>
        <Card>
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="border rounded px-3 py-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">#{o.orderNumber}</div>
                    <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                    <div className="text-sm">{o.customerName || "Client"} • {o.customerPhone || "-"}</div>
                  </div>
                  <Badge className={o.status === "pending" ? "bg-yellow-100" : o.status === "preparing" ? "bg-blue-100" : o.status === "ready" ? "bg-green-100" : "bg-gray-200"}>
                    {o.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {o.items.map((it) => (
                    <div key={it.productId}>{it.quantity} × {it.name} — {(it.price * it.quantity).toFixed(2)} €</div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => updateStatus(o.id, "preparing")}>Préparer</Button>
                  <Button onClick={() => updateStatus(o.id, "ready")}>Prête</Button>
                  <Button onClick={() => updateStatus(o.id, "served")}>Servie</Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
