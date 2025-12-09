'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { Supplier } from '@/types';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    unit: string;
    stock: number;
    images: string;
    description: string;
    rating: number | null;
    supplier_id: number;
}

interface ProductStats {
    total_products: number;
    in_stock: number;
    out_of_stock: number;
    high_rated: number;
}

export default function SupplierProductsPage() {
    const { user } = useAuth();
    const supplier = user as Supplier;
    const [products, setProducts] = useState<Product[]>([]);
    const [productStats, setProductStats] = useState<ProductStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchProducts();
        fetchProductStats();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await apiRequest<Product[]>('/suppliers/products');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProductStats = async () => {
        try {
            const stats = await apiRequest<ProductStats>('/suppliers/products/stats');
            setProductStats(stats);
        } catch (error) {
            console.error('Failed to fetch product stats:', error);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await apiRequest(`/suppliers/products/${productId}`, {
                method: 'DELETE'
            });
            alert('Product deleted successfully!');
            fetchProducts();
            fetchProductStats();
        } catch (error: any) {
            alert(`Failed to delete product: ${error.message}`);
        }
    };

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

    const categories = [
        { value: 'all', label: 'All Products' },
        { value: 'fertilizers', label: 'Fertilizers' },
        { value: 'seeds', label: 'Seeds' },
        { value: 'pesticides', label: 'Pesticides' },
        { value: 'tools', label: 'Tools' },
        { value: 'irrigation', label: 'Irrigation' },
        { value: 'other', label: 'Other' },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">Product Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your product catalog</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-trust-blue text-white rounded-lg hover:bg-trust-blue/90 font-semibold"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Product
                </button>
            </div>

            {/* Stats */}
            {productStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-charcoal/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-trust-blue mb-1">{productStats.total_products}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-indus-green mb-1">{productStats.in_stock}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">In Stock</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-alert-red mb-1">{productStats.out_of_stock}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl font-bold text-primary mb-1">{productStats.high_rated}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">High Rated (4+)</div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat.value
                                ? 'bg-trust-blue text-white'
                                : 'bg-white dark:bg-charcoal/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                    const imageArray = product.images.split(',');
                    return (
                        <div key={product.id} className="bg-white dark:bg-charcoal/20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
                                <div className="absolute top-2 right-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg text-charcoal dark:text-off-white">{product.name}</h3>
                                    {product.rating && (
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm text-yellow-500">star</span>
                                            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 mb-2">{product.category}</div>
                                <div className="mb-3">
                                    <div className="text-2xl font-bold text-trust-blue">PKR {product.price.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">per {product.unit}</div>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-trust-blue text-white rounded-lg hover:bg-trust-blue/90 text-sm font-semibold flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">inventory_2</span>
                    <h2 className="text-2xl font-semibold mb-2 text-charcoal dark:text-off-white">No Products Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {selectedCategory === 'all' ? "You haven't added any products yet" : `No products in ${selectedCategory} category`}
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-trust-blue text-white rounded-lg hover:bg-trust-blue/90 font-semibold"
                    >
                        Add Your First Product
                    </button>
                </div>
            )}

            {/* Add Product Modal (Placeholder) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-charcoal rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-charcoal dark:text-off-white">Add New Product</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-trust-blue mb-4 block">add_shopping_cart</span>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Product creation form coming soon!</p>
                                <p className="text-sm text-gray-500">Use the backend API POST /suppliers/products to add products</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
