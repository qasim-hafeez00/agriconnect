'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to appropriate dashboard if already logged in
    if (isAuthenticated && user) {
      if (user.role === 'farmer') {
        router.push('/farmer/dashboard');
      } else if (user.role === 'supplier') {
        router.push('/supplier/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indus-green via-primary to-trust-blue text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-black mb-6 font-urdu">
              AgriConnect
            </h1>
            <p className="text-xl sm:text-2xl mb-4">
              Empowering Farmers Through BNPL Solutions
            </p>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Pakistan's leading agricultural Buy Now, Pay Later platform connecting farmers with suppliers
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex-1 bg-off-white dark:bg-background-dark py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal dark:text-off-white mb-4">
              Choose Your Portal
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Select your role to access your dedicated dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Farmer Portal */}
            <Link href="/login?role=farmer" className="group">
              <div className="bg-white dark:bg-charcoal/20 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indus-green">
                <div className="w-20 h-20 bg-indus-green/10 dark:bg-indus-green/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-5xl text-indus-green">
                    agriculture
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-center mb-3 text-charcoal dark:text-off-white">
                  Farmer Portal
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6 font-urdu">
                  کسان پورٹل
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-indus-green text-sm mt-0.5">check_circle</span>
                    <span>Browse agricultural products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-indus-green text-sm mt-0.5">check_circle</span>
                    <span>Buy now, pay in installments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-indus-green text-sm mt-0.5">check_circle</span>
                    <span>Track orders & payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-indus-green text-sm mt-0.5">check_circle</span>
                    <span>Weather & crop insurance</span>
                  </li>
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-indus-green font-semibold group-hover:underline">
                    Access Farmer Portal →
                  </span>
                </div>
              </div>
            </Link>

            {/* Supplier Portal */}
            <Link href="/login?role=supplier" className="group">
              <div className="bg-white dark:bg-charcoal/20 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-trust-blue">
                <div className="w-20 h-20 bg-trust-blue/10 dark:bg-trust-blue/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-5xl text-trust-blue">
                    store
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-center mb-3 text-charcoal dark:text-off-white">
                  Supplier Portal
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6 font-urdu">
                  سپلائر پورٹل
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-trust-blue text-sm mt-0.5">check_circle</span>
                    <span>Manage product catalog</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-trust-blue text-sm mt-0.5">check_circle</span>
                    <span>Fulfill orders efficiently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-trust-blue text-sm mt-0.5">check_circle</span>
                    <span>Track sales & revenue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-trust-blue text-sm mt-0.5">check_circle</span>
                    <span>Performance analytics</span>
                  </li>
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-trust-blue font-semibold group-hover:underline">
                    Access Supplier Portal →
                  </span>
                </div>
              </div>
            </Link>

            {/* Admin Portal */}
            <Link href="/login?role=admin" className="group">
              <div className="bg-white dark:bg-charcoal/20 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary">
                <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    admin_panel_settings
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-center mb-3 text-charcoal dark:text-off-white">
                  Admin Portal
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6 font-urdu">
                  ایڈمن پورٹل
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span>Verify user documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span>Manage users & suppliers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span>Monitor system health</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span>Risk & credit management</span>
                  </li>
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-primary font-semibold group-hover:underline">
                    Access Admin Portal →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 pt-16 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-center mb-12 text-charcoal dark:text-off-white">
              Why AgriConnect?
            </h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indus-green/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-3xl text-indus-green">payments</span>
                </div>
                <h4 className="font-semibold mb-2">Flexible Payments</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pay in easy installments that match your crop cycle</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indus-green/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-3xl text-indus-green">verified_user</span>
                </div>
                <h4 className="font-semibold mb-2">Trusted Platform</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secure transactions with verified suppliers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indus-green/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-3xl text-indus-green">support_agent</span>
                </div>
                <h4 className="font-semibold mb-2">24/7 Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-urdu">اردو میں مدد</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indus-green/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-3xl text-indus-green">trending_up</span>
                </div>
                <h4 className="font-semibold mb-2">Grow Your Farm</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access credit to expand and modernize</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
