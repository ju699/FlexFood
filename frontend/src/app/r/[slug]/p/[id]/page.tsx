"use client";
export const dynamic = "force-dynamic";
import { use, useEffect, useState } from "react";
import { getRestaurantBySlug } from "@/services/restaurants";
import { getProductById } from "@/services/products";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Restaurant, Product } from "@/utils/types";
import Link from "next/link";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const run = async () => {
      const r = await getRestaurantBySlug(slug);
      setRestaurant(r);
      const p = await getProductById(id);
      setProduct(p);
    };
    run();
  }, [slug, id]);

  if (!restaurant || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  const handleOrder = () => {
    if (!restaurant.whatsapp) {
      alert("Ce restaurant n'a pas configuré de numéro WhatsApp.");
      return;
    }
    const phone = restaurant.whatsapp.replace(/\D/g, "");
    const message = `Bonjour, je souhaite commander ${product.name} (${product.price.toFixed(2)} FCFA)`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1;
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 107, 107, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Noise Texture */}
      <div className="noise"></div>

      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            <Link 
              href={`/r/${slug}`}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground hover:border-red-500/50 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs font-medium">Retour</span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">{restaurant.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Product Card */}
          <div className="gradient-border rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/80 to-black/80 mb-4">
            {/* Product Image */}
            <div className="relative w-full h-80 sm:h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group">
              {product.image ? (
                <>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70"></div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                  <svg className="w-20 h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Aucune image</span>
                </div>
              )}

              {/* Floating Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.category && (
                  <div className="px-3 py-1.5 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 rounded-lg">
                    <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {product.category}
                    </span>
                  </div>
                )}
                {product.cookingTime && (
                  <div className="px-3 py-1.5 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 rounded-lg">
                    <span className="text-xs font-semibold text-orange-300 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {product.cookingTime} min
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 sm:p-6">
              {/* Title and Price */}
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prix</span>
                    <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                      {product.price.toFixed(0)} FCFA
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.tags.map((t) => (
                      <span 
                        key={t} 
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 flex items-center gap-1"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-4 pb-4 border-b border-gray-800">
                  <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Description
                  </h2>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Simple Order Button */}
          <div className="px-3 pb-4">
            <button
              onClick={handleOrder}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Commander
            </button>
          </div>


        </div>
      </div>


    </div>
  );
}
