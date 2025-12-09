'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  images: string;
  supplier_id: number;
  is_available: boolean;
  sku?: string; // Optional if not in backend model yet
}

export default function Page() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (user?.role === 'supplier') {
        try {
          const data = await apiRequest<Product[]>('/suppliers/products', { method: 'GET' });
          setProducts(data);
        } catch (error) {
          console.error("Failed to fetch products", error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    if (isAuthenticated && user?.role === 'supplier') {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full">
        {/* Filters Sidebar */}
        <aside className="flex-shrink-0 w-72 bg-container-light dark:bg-container-dark border-r border-border-light dark:border-border-dark p-6 flex flex-col gap-6 mobile-hidden">
          <h2 className="text-lg font-bold">Filters</h2>
          <div className="relative">
            <input className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary" placeholder="Search by name or SKU..." type="text" />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Category</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                <span>Seeds</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                <span>Fertilizers</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                <span>Pesticides</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                <span>Equipment</span>
              </label>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">My Products Catalog</h1>
              <div className="flex gap-3">
                <button className="flex items-center justify-center h-10 px-4 rounded-md bg-secondary text-white text-sm font-bold">
                  <span>Export catalog</span>
                </button>
                <button className="flex items-center justify-center h-10 px-4 rounded-md bg-primary text-white text-sm font-bold">
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="bg-container-light dark:bg-container-dark border border-border-light dark:border-border-dark rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center" style={{ backgroundImage: `url(${product.images?.split(',')[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      {!product.images && <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">image</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Unit: {product.unit}</p>
                      <div className="flex justify-between items-center my-3">
                        <span className="font-bold text-lg">Rs {product.price.toLocaleString()}</span>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full text-white ${product.stock < 10 ? 'bg-status-red' : 'bg-status-green'}`}>{product.stock} units</span>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-border-light dark:border-border-dark">
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit"><span className="material-symbols-outlined">edit</span></button>
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-border-light dark:border-border-dark rounded-xl mt-8">
                  <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-8xl text-gray-400 dark:text-gray-500">inventory_2</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Your catalog is empty</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first agricultural product.</p>
                  <button className="flex items-center justify-center h-12 px-6 rounded-md bg-primary text-white text-base font-bold">
                    <span className="material-symbols-outlined mr-2">add</span>
                    <span>Add your first product</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
