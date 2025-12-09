'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Supplier } from '@/types';

export default function SupplierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'supplier') {
            router.push('/login?role=supplier');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'supplier') {
        return null;
    }

    const supplier = user as Supplier;

    const navItems = [
        { icon: 'dashboard', label: 'Dashboard', href: '/supplier/dashboard' },
        { icon: 'inventory_2', label: 'Products', href: '/supplier/products' },
        { icon: 'shopping_bag', label: 'Orders', href: '/supplier/orders' },
        { icon: 'payments', label: 'Finance', href: '/supplier/finance' },
        { icon: 'bar_chart', label: 'Analytics', href: '/supplier/analytics' },
        { icon: 'settings', label: 'Settings', href: '/supplier/settings' },
    ];

    return (
        <div className="min-h-screen bg-off-white dark:bg-background-dark">
            {/* Top Navigation */}
            <nav className="bg-white dark:bg-charcoal/20 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/supplier/dashboard" className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-trust-blue">store</span>
                            <div>
                                <div className="font-black text-xl text-charcoal dark:text-off-white">AgriConnect</div>
                                <div className="text-xs text-gray-500 font-urdu">سپلائر پورٹل</div>
                            </div>
                        </Link>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">notifications</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full"></span>
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold text-charcoal dark:text-off-white">{supplier.name}</div>
                                    <div className="text-xs text-gray-500">{supplier.businessName}</div>
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
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-trust-blue/10 text-gray-700 dark:text-gray-300 hover:text-trust-blue transition-colors"
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
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
                <div className="grid grid-cols-4 gap-1">
                    {navItems.slice(0, 4).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center py-2 text-gray-600 dark:text-gray-400 hover:text-trust-blue"
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
