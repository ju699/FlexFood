"use client";
export const dynamic = "force-dynamic";
import { use, useEffect, useMemo, useState } from "react";
import { getRestaurantBySlug } from "@/services/restaurants";
import { listProductsByRestaurant } from "@/services/products";
import { listCategoriesByRestaurant } from "@/services/categories";
import { Restaurant, Product, Category } from "@/utils/types";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Button from "@/components/ui/Button";

import { useRouter } from "next/navigation";
export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const run = async () => {
      const r = await getRestaurantBySlug(slug);
      if (!r) return;
      setRestaurant(r);
      const [p, c] = await Promise.all([
        listProductsByRestaurant(r.id, true),
        listCategoriesByRestaurant(r.id),
      ]);
      setProducts(p);
      setCategories(c);
    };
    run();
  }, [slug]);

  const handleOrder = (product: Product) => {
    if (!restaurant?.whatsapp) {
      alert("Ce restaurant n'a pas configuré de numéro WhatsApp.");
      return;
    }
    const phone = restaurant.whatsapp.replace(/\D/g, "");
    const message = `Bonjour, je souhaite commander ${product.name} (${product.price.toFixed(2)} FCFA)`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(p => 
      p.categoryId === activeCategory || 
      (!p.categoryId && p.category === categories.find(c => c.id === activeCategory)?.name)
    );
  }, [products, activeCategory, categories]);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .gradient-border {
          position: relative;
          background: rgba(15, 15, 15, 0.6);
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
          pointer-events: none;
        }

        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(255, 107, 107, 0.2);
        }

        .category-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-btn:hover {
          transform: translateY(-2px);
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Noise Texture */}
      <div className="noise"></div>

      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-56 md:h-80 overflow-hidden">
        {restaurant.coverImage ? (
          <>
            <img 
              src={restaurant.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 via-orange-500 to-red-600 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black"></div>
          </div>
        )}

        {/* Logo Overlay */}
        <div className="absolute -bottom-12 left-6 z-20">
          <div className="w-24 h-24 md:w-28 md:h-28 gradient-border rounded-2xl p-1 shadow-2xl animate-float">
            {restaurant.logo ? (
              <img 
                src={restaurant.logo} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-xl" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-black/70 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-24">
          {/* Restaurant Info */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {restaurant.city && (
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{restaurant.city}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{restaurant.phone}</span>
                </div>
              )}
              {restaurant.openingHours && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-xs font-medium">Ouvert</span>
                </div>
              )}
            </div>
          </div>

          {/* Categories Navigation */}
          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`category-btn px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === "all" 
                      ? "bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30" 
                      : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-red-500/50 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Tout ({products.length})
                  </span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => 
                    p.categoryId === cat.id || 
                    (!p.categoryId && p.category === cat.name)
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`category-btn px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeCategory === cat.id 
                          ? "bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30" 
                          : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-red-500/50 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {cat.name} ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg mb-2">Aucun plat disponible</p>
              <p className="text-gray-600 text-sm">Cette catégorie est vide pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-4 md:gap-5">
              {filteredProducts.map((p) => (
                <div 
                  key={p.id}
                  className="product-card gradient-border rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/80 to-black/80 cursor-pointer"
                  onClick={() => router.push(`/r/${slug}/p/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push(`/r/${slug}/p/${p.id}`); }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 sm:h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex-shrink-0 overflow-hidden relative group">
                      {p.image ? (
                        <>
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Pas d'image</span>
                        </div>
                      )}
                      
                      {/* Cooking Time Badge */}
                      {p.cookingTime && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg flex items-center gap-1">
                          <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-white font-medium">{p.cookingTime}min</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-lg sm:text-xl text-white leading-tight">
                            {p.name}
                          </h3>
                          {p.category && (
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-400 whitespace-nowrap flex-shrink-0">
                              {p.category}
                            </span>
                          )}
                        </div>
                        
                        {p.description && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            {p.description}
                          </p>
                        )}

                        {/* Tags */}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {p.tags.map(t => (
                              <span 
                                key={t} 
                                className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs text-gray-400"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-800">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Prix</span>
                          <span className="font-bold text-2xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                            {p.price.toFixed(0)} FCFA
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOrder(p); }}
                          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:scale-105"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span className="hidden sm:inline">Commander</span>
                          <span className="sm:hidden">WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Contact Button */}
      {restaurant.whatsapp && (
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-5 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/50 transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="hidden md:inline font-semibold">Nous contacter</span>
          </a>
        </div>
      )}
    </div>
  );
}
