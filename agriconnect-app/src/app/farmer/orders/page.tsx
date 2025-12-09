'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';

export default function OrdersPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [showSuccess, setShowSuccess] = useState(false);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 8000); // Extended to 8 seconds
            // Force refresh orders after successful placement
            if (user) {
                fetchOrders();
            }
        }
    }, [searchParams, user]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest<any[]>('/orders/');
            console.log('Fetched orders:', data); // Debug log
            // Map backend response to frontend Order type
            const mappedOrders: Order[] = data.map(o => ({
                id: o.id.toString(),
                farmerId: o.farmer_id.toString(),
                farmerName: user?.name || 'Unknown',
                supplierId: o.supplier_id.toString(),
                supplierName: "Supplier #" + o.supplier_id,
                items: [],
                subtotal: o.total_amount,
                tax: 0,
                total: o.total_amount,
                status: o.status.toLowerCase() as OrderStatus,
                orderDate: new Date(o.created_at),
                deliveryAddress: o.delivery_address,
                paymentMethod: o.payment_method.toLowerCase() as 'bnpl' | 'cash',
                paymentStatus: o.payment_status.toLowerCase() as 'pending' | 'paid' | 'overdue',
                notes: o.notes
            }));
            console.log('Mapped orders:', mappedOrders); // Debug log
            setOrders(mappedOrders);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const statusConfig: Record<OrderStatus, { color: string; icon: string; label: string }> = {
        pending: { color: 'yellow', icon: 'schedule', label: 'Pending' },
        confirmed: { color: 'blue', icon: 'check_circle', label: 'Confirmed' },
        processing: { color: 'indigo', icon: 'sync', label: 'Processing' },
        shipped: { color: 'purple', icon: 'local_shipping', label: 'Shipped' },
        delivered: { color: 'green', icon: 'done_all', label: 'Delivered' },
        cancelled: { color: 'red', icon: 'cancel', label: 'Cancelled' },
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading orders...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            {/* Success Message */}
            {showSuccess && (
                <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-xl flex items-start gap-4 shadow-lg animate-pulse">
                    <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                    <div className="flex-1">
                        <div className="font-bold text-xl text-green-800 dark:text-green-200 mb-1">🎉 Order Placed Successfully!</div>
                        <div className="text-green-700 dark:text-green-300">Your order has been confirmed and will be processed soon. You can see it below.</div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-charcoal dark:text-off-white">My Orders</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track and manage your orders ({orders.length} total)</p>
                </div>
                <button
                    onClick={() => fetchOrders()}
                    className="px-4 py-2 bg-indus-green text-white rounded-lg hover:bg-indus-green/90 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'all'
                        ? 'bg-indus-green text-white'
                        : 'bg-white dark:bg-charcoal/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    All Orders ({orders.length})
                </button>
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = orders.filter(o => o.status === status).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={status}
                            onClick={() => setFilter(status as OrderStatus)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-indus-green text-white'
                                : 'bg-white dark:bg-charcoal/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{config.icon}</span>
                            {config.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">shopping_bag</span>
                    <h2 className="text-2xl font-semibold mb-2 text-charcoal dark:text-off-white">No Orders Found</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {filter === 'all' ? 'You haven\'t placed any orders yet' : `No ${statusConfig[filter as OrderStatus]?.label.toLowerCase()} orders`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const config = statusConfig[order.status] || statusConfig.pending;
                        return (
                            <div key={order.id} className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                {/* Order Header */}
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Order ID</div>
                                        <div className="font-mono font-semibold text-charcoal dark:text-off-white">
                                            {order.id.toString().substring(0, 8)}...
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Order Date</div>
                                        <div className="font-semibold">{order.orderDate.toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Status</div>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-${config.color}-100 text-${config.color}-700 dark:bg-${config.color}-900/30 dark:text-${config.color}-300`}>
                                            <span className="material-symbols-outlined text-sm">{config.icon}</span>
                                            {config.label}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Total</div>
                                        <div className="text-xl font-bold text-indus-green">PKR {order.total.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Order Items (Empty as backend doesn't send yet) */}
                                {order.items.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="font-medium">{item.productName}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {item.quantity} × {item.unit} @ PKR {item.price.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="font-semibold">
                                                    PKR {(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 italic mb-4">
                                        See details for items...
                                    </div>
                                )}

                                {/* Order Details */}
                                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Supplier</div>
                                        <div className="font-medium">{order.supplierName}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Payment Method</div>
                                        <div className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Delivery Address</div>
                                        <div className="font-medium line-clamp-2">{order.deliveryAddress}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
