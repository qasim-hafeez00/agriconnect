'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';
import { Farmer } from '@/types';

export default function FarmerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'farmer') {
            router.push('/login?role=farmer');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'farmer') {
        return null;
    }

    const farmer = user as Farmer;

    const navItems = [
        { icon: 'dashboard', label: 'Dashboard', href: '/farmer/dashboard' },
        { icon: 'store', label: 'Marketplace', href: '/farmer/marketplace' },
        { icon: 'shopping_cart', label: 'My Orders', href: '/farmer/orders', badge: itemCount },
        { icon: 'account_balance_wallet', label: 'Wallet', href: '/farmer/wallet' },
        { icon: 'shield', label: 'Insurance', href: '/farmer/insurance' },
        { icon: 'partly_cloudy_day', label: 'Weather', href: '/farmer/weather' },
        { icon: 'groups', label: 'Community', href: '/farmer/community' },
        { icon: 'support_agent', label: 'Help', href: '/farmer/help' },
    ];

    return (
        <div className="min-h-screen bg-off-white dark:bg-background-dark">
            {/* Top Navigation */}
            <nav className="bg-white dark:bg-charcoal/20 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/farmer/dashboard" className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-indus-green">agriculture</span>
                            <div>
                                <div className="font-black text-xl text-charcoal dark:text-off-white">AgriConnect</div>
                                <div className="text-xs text-gray-500 font-urdu">کسان پورٹل</div>
                            </div>
                        </Link>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">notifications</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full"></span>
                            </button>

                            {/* Cart */}
                            <Link href="/farmer/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">shopping_cart</span>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-indus-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu */}
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold text-charcoal dark:text-off-white">{farmer.name}</div>
                                    <div className="text-xs text-gray-500">{farmer.farmName}</div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Logout"
                                >
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content with Sidebar */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 bg-white dark:bg-charcoal/20 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indus-green/10 text-gray-700 dark:text-gray-300 hover:text-indus-green transition-colors relative"
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-auto bg-indus-green text-white text-xs rounded-full px-2 py-0.5 font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-charcoal/20 border-t border-gray-200 dark:border-gray-700 z-50">
                <div className="grid grid-cols-5 gap-1">
                    {navItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center py-2 text-gray-600 dark:text-gray-400 hover:text-indus-green relative"
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute top-1 right-2 bg-indus-green text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
