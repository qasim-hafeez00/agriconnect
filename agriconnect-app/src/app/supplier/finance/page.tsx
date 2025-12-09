'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface FinanceData {
    total_revenue: number;
    platform_fee: number;
    available_balance: number;
    pending_orders_value: number;
}

export default function SupplierFinancePage() {
    const [financeData, setFinanceData] = useState<FinanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            const data = await apiRequest<FinanceData>('/suppliers/finance/balance');
            setFinanceData(data);
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !financeData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">Finance & Settlements</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your earnings and payments</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indus-green to-indus-green/80 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                        <div className="text-sm opacity-90">Available Balance</div>
                    </div>
                    <div className="text-3xl font-bold">PKR {financeData.available_balance.toLocaleString()}</div>
                    <div className="text-sm opacity-75 mt-1">Ready for withdrawal</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined">trending_up</span>
                        <div className="text-sm">Total Revenue</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">PKR {financeData.total_revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">From delivered orders</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined">receipt</span>
                        <div className="text-sm">Platform Fee (10%)</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">PKR {financeData.platform_fee.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">Service charges</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined">schedule</span>
                        <div className="text-sm">Pending Orders</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">PKR {financeData.pending_orders_value.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">Being processed</div>
                </div>
            </div>

            {/* Request Payout Section */}
            <div className="bg-white dark:bg-charcoal/20 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-charcoal dark:text-off-white mb-2">Request Payout</h2>
                        <p className="text-gray-600 dark:text-gray-400">Transfer your available balance to your bank account</p>
                    </div>
                    <span className="material-symbols-outlined text-6xl text-trust-blue">payments</span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available for withdrawal</div>
                    <div className="text-4xl font-bold text-indus-green mb-4">PKR {financeData.available_balance.toLocaleString()}</div>
                    <button
                        className="w-full md:w-auto px-8 py-3 bg-indus-green text-white rounded-lg hover:bg-indus-green/90 font-semibold flex items-center justify-center gap-2"
                        onClick={() => alert('Payout request functionality coming soon!')}
                    >
                        <span className="material-symbols-outlined">send</span>
                        Request Payout
                    </button>
                </div>

                <div className="text-sm text-gray-500">
                    <p className="mb-1">• Minimum payout amount: PKR 1,000</p>
                    <p className="mb-1">• Processing time: 2-3 business days</p>
                    <p>• Make sure your bank details are up to date in Settings</p>
                </div>
            </div>

            {/* Transaction History Placeholder */}
            <div className="bg-white dark:bg-charcoal/20 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-charcoal dark:text-off-white mb-4">Transaction History</h2>
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">history</span>
                    <p className="text-gray-600 dark:text-gray-400">Transaction history will be displayed here</p>
                    <p className="text-sm text-gray-500 mt-2">All payouts and settlements will be tracked</p>
                </div>
            </div>
        </div>
    );
}
