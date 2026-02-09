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
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

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

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { label: "En attente", color: "from-yellow-500/20 to-yellow-600/20", textColor: "text-yellow-400", borderColor: "border-yellow-500/30", icon: "⏳" };
      case "preparing":
        return { label: "En préparation", color: "from-blue-500/20 to-blue-600/20", textColor: "text-blue-400", borderColor: "border-blue-500/30", icon: "👨‍🍳" };
      case "ready":
        return { label: "Prête", color: "from-green-500/20 to-green-600/20", textColor: "text-green-400", borderColor: "border-green-500/30", icon: "✓" };
      case "served":
        return { label: "Servie", color: "from-gray-500/20 to-gray-600/20", textColor: "text-gray-400", borderColor: "border-gray-500/30", icon: "✓✓" };
      default:
        return { label: status, color: "from-gray-500/20 to-gray-600/20", textColor: "text-gray-400", borderColor: "border-gray-500/30", icon: "•" };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Chargement des commandes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    served: orders.filter((o) => o.status === "served").length,
  };

  return (
    <DashboardLayout>
      <style jsx>{`
        .gradient-border {
          position: relative;
          background: var(--card-bg-transparent);
          backdrop-filter: blur(12px);
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 154, 0, 0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .order-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.1);
        }

        .filter-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-btn:hover {
          transform: translateY(-2px);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Commandes</h1>
            <p className="text-gray-400">Gérez vos commandes en temps réel</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
            <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></span>
            <span className="text-sm text-green-400 font-medium">En direct</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: "all", label: "Toutes", count: statusCounts.all, color: "from-gray-500/20 to-gray-600/20", icon: "📦" },
            { key: "pending", label: "En attente", count: statusCounts.pending, color: "from-yellow-500/20 to-yellow-600/20", icon: "⏳" },
            { key: "preparing", label: "En préparation", count: statusCounts.preparing, color: "from-blue-500/20 to-blue-600/20", icon: "👨‍🍳" },
            { key: "ready", label: "Prêtes", count: statusCounts.ready, color: "from-green-500/20 to-green-600/20", icon: "✓" },
            { key: "served", label: "Servies", count: statusCounts.served, color: "from-purple-500/20 to-purple-600/20", icon: "✓✓" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key as any)}
              className={`filter-btn gradient-border rounded-xl p-4 text-center bg-gradient-to-br ${stat.color} ${
                filter === stat.key ? "ring-2 ring-red-500/50" : ""
              }`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.count}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="gradient-border rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">Aucune commande</p>
            <p className="text-gray-600 text-sm">
              {filter === "all" ? "Aucune commande pour le moment" : `Aucune commande ${getStatusInfo(filter as Order["status"]).label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

              return (
                <div key={order.id} className="order-card gradient-border rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4 pb-4 md:gap-4 md:mb-6 md:pb-6 border-b border-gray-800">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg md:text-xl font-bold text-foreground">#{order.orderNumber}</h3>
                            <span className={`px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r ${statusInfo.color} border ${statusInfo.borderColor} rounded-lg text-xs md:text-sm font-semibold ${statusInfo.textColor}`}>
                              {statusInfo.icon} {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(order.createdAt).toLocaleString("fr-FR", { 
                                day: "2-digit", 
                                month: "short", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {order.customerName || "Client"}
                            </span>
                            {order.customerPhone && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {order.customerPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500 mb-1">Total</div>
                        <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                          {totalAmount.toFixed(2)} FCFA
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4 md:mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Articles</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={item.productId || index} className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-xl border border-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">{item.quantity}x</span>
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm md:text-base">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.price.toFixed(2)} FCFA / unité</div>
                              </div>
                            </div>
                            <div className="font-bold text-orange-400 text-sm md:text-base">
                              {(item.price * item.quantity).toFixed(2)} FCFA
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {order.status === "pending" && (
                        <button
                          onClick={() => updateStatus(order.id, "preparing")}
                          className="flex-1 sm:flex-none px-4 py-2 md:px-6 md:py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 font-semibold rounded-xl transition-all text-sm md:text-base"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Commencer
                          </span>
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => updateStatus(order.id, "ready")}
                          className="flex-1 sm:flex-none px-4 py-2 md:px-6 md:py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 text-green-400 font-semibold rounded-xl transition-all text-sm md:text-base"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Marquer prête
                          </span>
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => updateStatus(order.id, "served")}
                          className="flex-1 sm:flex-none px-4 py-2 md:px-6 md:py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 font-semibold rounded-xl transition-all text-sm md:text-base"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Marquer servie
                          </span>
                        </button>
                      )}
                      {order.status === "served" && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl text-gray-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Terminée</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
