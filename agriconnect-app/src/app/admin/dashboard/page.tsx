'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
    pending_reviews: number;
    approved: number;
    rejected: number;
    total_farmers: number;
    total_suppliers: number;
    total_orders: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiRequest<DashboardStats>('/admin/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            setError('Failed to load admin dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen p-4">
                <div className="text-red-500 text-center mb-4">
                    <span className="material-symbols-outlined text-4xl mb-2">error_outline</span>
                    <p className="text-xl font-bold">Unable to load dashboard</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{error || "No data available"}</p>
                </div>
                <button
                    onClick={fetchDashboardStats}
                    className="px-6 py-2 bg-trust-blue text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Platform overview and management</p>
            </div>

            {/* KYC Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link href="/admin/kyc?tab=pending" className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-4xl">pending_actions</span>
                        <div className="text-sm opacity-90">Pending Reviews</div>
                    </div>
                    <div className="text-4xl font-bold">{stats.pending_reviews}</div>
                    <div className="text-sm opacity-75 mt-1">Requires action</div>
                </Link>

                <Link href="/admin/kyc?tab=approved" className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                        <div className="text-sm opacity-90">Approved</div>
                    </div>
                    <div className="text-4xl font-bold">{stats.approved}</div>
                    <div className="text-sm opacity-75 mt-1">Active users</div>
                </Link>

                <Link href="/admin/kyc?tab=rejected" className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-4xl">cancel</span>
                        <div className="text-sm opacity-90">Rejected</div>
                    </div>
                    <div className="text-4xl font-bold">{stats.rejected}</div>
                    <div className="text-sm opacity-75 mt-1">Not approved</div>
                </Link>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-3xl">group</span>
                        <div className="text-sm">Total Farmers</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">{stats.total_farmers}</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-3xl">store</span>
                        <div className="text-sm">Total Suppliers</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">{stats.total_suppliers}</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-3xl">shopping_bag</span>
                        <div className="text-sm">Total Orders</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">{stats.total_orders}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/kyc" className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-trust-blue transition-all group">
                    <div className="w-12 h-12 bg-trust-blue/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform mx-auto">
                        <span className="material-symbols-outlined text-trust-blue text-2xl">verified_user</span>
                    </div>
                    <div className="text-sm font-semibold text-center">KYC Verification</div>
                </Link>

                <Link href="/admin/farmers" className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indus-green transition-all group">
                    <div className="w-12 h-12 bg-indus-green/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform mx-auto">
                        <span className="material-symbols-outlined text-indus-green text-2xl">agriculture</span>
                    </div>
                    <div className="text-sm font-semibold text-center">Manage Farmers</div>
                </Link>

                <Link href="/admin/suppliers" className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform mx-auto">
                        <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                    </div>
                    <div className="text-sm font-semibold text-center">Manage Suppliers</div>
                </Link>

                <Link href="/admin/analytics" className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-trust-blue transition-all group">
                    <div className="w-12 h-12 bg-trust-blue/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform mx-auto">
                        <span className="material-symbols-outlined text-trust-blue text-2xl">analytics</span>
                    </div>
                    <div className="text-sm font-semibold text-center">View Analytics</div>
                </Link>
            </div>
        </div>
    );
}
