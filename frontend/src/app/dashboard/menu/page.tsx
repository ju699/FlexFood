"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getRestaurantByOwner } from "@/services/restaurants";
import { createCategory, deleteCategory, listCategoriesByRestaurant, updateCategory } from "@/services/categories";
import { createProduct, deleteProduct, listProductsByRestaurant, updateProduct } from "@/services/products";
import { uploadImageResumable, uploadImage } from "@/services/storage";
import { compressImage } from "@/utils/image";
import { Category, Product, Restaurant } from "@/utils/types";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function MenuPage() {
  const { user, loading } = useProtectedRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  
  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // UI States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  
  // Forms
  const [catName, setCatName] = useState("");
  
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCookingTime, setProdCookingTime] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodTags, setProdTags] = useState("");
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [prodExistingImage, setProdExistingImage] = useState<string | null>(null);
  const [allowNoImage, setAllowNoImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const r = await getRestaurantByOwner(user.uid);
      setRestaurant(r);
      if (r) {
        const [cats, prods] = await Promise.all([
          listCategoriesByRestaurant(r.id),
          listProductsByRestaurant(r.id)
        ]);
        setCategories(cats);
        setProducts(prods);
      }
    };
    if (!loading) fetchData();
  }, [user, loading]);

  // --- Category Handlers ---

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    const id = await createCategory({
      restaurantId: restaurant.id,
      name: catName,
      createdAt: Date.now(),
    });
    setCategories([...categories, { id, restaurantId: restaurant.id, name: catName, createdAt: Date.now() }]);
    setCatName("");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, { name: catName });
    setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: catName } : c));
    setEditingCategory(null);
    setCatName("");
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await deleteCategory(id);
    setCategories(categories.filter(c => c.id !== id));
  };

  const startEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
  };

  // --- Product Handlers ---

  const resetProductForm = () => {
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdCookingTime("");
    setProdCategoryId("");
    setProdTags("");
    setProdFile(null);
    setProdExistingImage(null);
    setEditingProduct(null);
    setIsProductModalOpen(false);
    setProductError(null);
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description || "");
    setProdPrice(String(p.price));
    setProdCookingTime(p.cookingTime ? String(p.cookingTime) : "");
    setProdCategoryId(p.categoryId || "");
    setProdTags(p.tags ? p.tags.join(", ") : "");
    setProdExistingImage(p.image || null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setProductError(null);
    setIsSavingProduct(true);

    try {
      if (!prodName.trim() || isNaN(parseFloat(prodPrice))) {
        setProductError("Veuillez saisir un nom et un prix valides.");
        setIsSavingProduct(false);
        return;
      }

      if (!prodFile && !prodExistingImage && !allowNoImage) {
        setProductError("Veuillez sélectionner une image ou cocher « Créer sans image ».");
        setIsSavingProduct(false);
        return;
      }

      let imageUrl = prodExistingImage;
      if (prodFile) {
        setUploadProgress(0);
        const compressed = await compressImage(prodFile, { maxWidth: 1200, maxHeight: 1200, mimeType: "image/jpeg", quality: 0.8 });
        try {
          imageUrl = await uploadImageResumable(
            compressed,
            `restaurants/${restaurant.id}/products/${Date.now()}_${compressed.name}`,
            (p) => setUploadProgress(p)
          );
        } catch (e: any) {
          imageUrl = await uploadImage(
            compressed,
            `restaurants/${restaurant.id}/products/${Date.now()}_${compressed.name}`
          );
        }
      }

      const productData = {
        restaurantId: restaurant.id,
        name: prodName.trim(),
        description: prodDesc,
        price: parseFloat(prodPrice),
        cookingTime: prodCookingTime ? parseInt(prodCookingTime) : null,
        categoryId: prodCategoryId || null,
        category: categories.find(c => c.id === prodCategoryId)?.name || null,
        tags: prodTags.split(",").map(t => t.trim()).filter(Boolean),
        image: imageUrl,
        isAvailable: editingProduct ? editingProduct.isAvailable : true,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData, id: p.id } : p));
      } else {
        const id = await createProduct(productData);
        setProducts([...products, { ...productData, id }]);
      }
      resetProductForm();
    } catch (err: any) {
      const code = err?.code || "";
      const msg =
        code === "storage/retry-limit-exceeded"
          ? "Le téléversement a expiré. Réessayez avec une image plus légère ou une connexion stable."
          : err?.message
            ? `Erreur: ${err.message}`
            : "Erreur lors de l'enregistrement du produit.";
      setProductError(msg);
    } finally {
      setIsSavingProduct(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  const toggleAvailability = async (p: Product) => {
    await updateProduct(p.id, { isAvailable: !p.isAvailable });
    setProducts(products.map(it => it.id === p.id ? { ...it, isAvailable: !it.isAvailable } : it));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Chargement du menu...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">Restaurant introuvable.</p>
            <a href="/dashboard" className="text-red-400 hover:text-red-300 font-medium">
              Retour à l'accueil →
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style jsx>{`
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

        .input-field {
          background: rgba(30, 30, 30, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          transition: all 0.3s;
        }

        .input-field:focus {
          background: rgba(30, 30, 30, 0.8);
          border-color: rgba(255, 107, 107, 0.5);
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        .category-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.15);
        }

        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover {
          background: rgba(255, 107, 107, 0.05);
          border-color: rgba(255, 107, 107, 0.2);
        }

        .checkbox-custom {
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          background: rgba(30, 30, 30, 0.5);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .checkbox-custom:checked {
          background: linear-gradient(135deg, #ff6b6b, #ff9a00);
          border-color: transparent;
        }

        .checkbox-custom:checked::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 0.875rem;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestion du Menu</h1>
            <p className="text-gray-400">Organisez vos catégories et plats</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-purple-400">{products.length} plats • {categories.length} catégories</span>
          </div>
        </div>

        {/* Categories Section */}
        <div className="gradient-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Catégories</h2>
          </div>

          <div className="flex gap-3 mb-6">
            <Input 
              placeholder="Nouvelle catégorie..." 
              value={catName} 
              onChange={(e) => setCatName(e.target.value)}
              className="input-field flex-1 px-4 py-3 rounded-xl"
            />
            {editingCategory ? (
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleUpdateCategory}
                  className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Modifier
                </Button>
                <Button 
                  onClick={() => { setEditingCategory(null); setCatName(""); }}
                  className="bg-black/50 border border-gray-800 text-white hover:bg-gray-900 rounded-xl"
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleCreateCategory}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </Button>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p>Aucune catégorie. Créez-en une pour organiser vos plats.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="category-card gradient-border rounded-xl p-4 flex justify-between items-center bg-gradient-to-br from-purple-500/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-white">{cat.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditCategory(cat)} 
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)} 
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="gradient-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Produits ({products.length})</h2>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setIsProductModalOpen(true)}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Plat
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg mb-2">Aucun plat dans votre menu</p>
              <p className="text-sm">Cliquez sur "Nouveau Plat" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map(p => (
                <div key={p.id} className="product-card flex flex-col md:flex-row gap-4 border border-gray-800 p-4 rounded-xl bg-black/30">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex-shrink-0 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs mt-1">No img</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2">{p.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          {p.category && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {p.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-semibold text-orange-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {p.price.toFixed(2)} FCFA
                          </span>
                          {p.cookingTime && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {p.cookingTime} min
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => toggleAvailability(p)} 
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            p.isAvailable 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30" 
                              : "bg-gray-800 text-gray-500 border border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          {p.isAvailable ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Disponible
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Indisponible
                            </span>
                          )}
                        </button>
                        <button 
                          onClick={() => startEditProduct(p)} 
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)} 
                          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-sm text-gray-400 mb-3">{p.description}</p>
                    )}

                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map(t => (
                          <span key={t} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {editingProduct ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                </div>
                {editingProduct ? "Modifier le plat" : "Nouveau plat"}
              </h2>
              <button 
                onClick={resetProductForm}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {productError && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-400">{productError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Nom du plat *
                  </label>
                  <Input 
                    value={prodName} 
                    onChange={e => setProdName(e.target.value)} 
                    required
                    className="input-field w-full px-4 py-3 rounded-xl"
                    placeholder="Ex: Burger Classic"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prix (FCFA) *
                  </label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={prodPrice} 
                    onChange={e => setProdPrice(e.target.value)} 
                    required
                    className="input-field w-full px-4 py-3 rounded-xl"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Description
                </label>
                <textarea 
                  className="input-field w-full px-4 py-3 rounded-xl resize-none"
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="Décrivez votre plat..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Catégorie
                  </label>
                  <select 
                    className="input-field w-full px-4 py-3 rounded-xl cursor-pointer"
                    value={prodCategoryId}
                    onChange={e => setProdCategoryId(e.target.value)}
                  >
                    <option value="">-- Choisir --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Temps de cuisson (min)
                  </label>
                  <Input 
                    type="number" 
                    value={prodCookingTime} 
                    onChange={e => setProdCookingTime(e.target.value)}
                    className="input-field w-full px-4 py-3 rounded-xl"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Étiquettes (séparées par des virgules)
                </label>
                <Input 
                  placeholder="Ex: Nouveau, Pimenté, Végétarien" 
                  value={prodTags} 
                  onChange={e => setProdTags(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image du plat
                </label>
                {prodExistingImage && (
                  <div className="mb-4">
                    <img src={prodExistingImage} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-800" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setProdFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 file:cursor-pointer cursor-pointer"
                />
                <div className="flex items-center gap-2 mt-3">
                  <input
                    id="allowNoImage"
                    type="checkbox"
                    checked={allowNoImage}
                    onChange={(e) => setAllowNoImage(e.target.checked)}
                    className="checkbox-custom"
                  />
                  <label htmlFor="allowNoImage" className="text-sm text-gray-400 cursor-pointer">
                    Créer sans image
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-2">Cochez « Créer sans image » pour enregistrer sans upload.</p>
                
                {isSavingProduct && prodFile && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>Upload en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                <Button 
                  type="button" 
                  onClick={resetProductForm}
                  className="px-6 py-3 bg-black/50 border border-gray-800 text-white hover:bg-gray-900 rounded-xl"
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSavingProduct}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingProduct ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
