'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface RiskPortfolio {
    total_outstanding: number;
    portfolio_at_risk: number;
    avg_risk_score: number;
    high_risk_farmers_count: number;
}

interface SystemHealth {
    database_status: string;
    active_users: number;
    total_orders: number;
    system_uptime: string;
}

export default function AdminRiskManagementPage() {
    const [riskData, setRiskData] = useState<RiskPortfolio | null>(null);
    const [healthData, setHealthData] = useState<SystemHealth | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [risk, health] = await Promise.all([
                apiRequest<RiskPortfolio>('/admin/risk/portfolio'),
                apiRequest<SystemHealth>('/admin/system/health')
            ]);
            setRiskData(risk);
            setHealthData(health);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !riskData || !healthData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">Risk Management & System Health</h1>
                <p className="text-gray-600 dark:text-gray-400">Monitor portfolio risk and system performance</p>
            </div>

            {/* Risk Portfolio Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined">warning</span>
                        <div className="text-sm opacity-90">Portfolio at Risk</div>
                    </div>
                    <div className="text-3xl font-bold">PKR {riskData.portfolio_at_risk.toLocaleString()}</div>
                    <div className="text-sm opacity-75 mt-1">High-risk debt</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined">account_balance</span>
                        <div className="text-sm">Total Outstanding</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">PKR {riskData.total_outstanding.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">All BNPL debt</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined">speed</span>
                        <div className="text-sm">Avg Risk Score</div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white">{riskData.avg_risk_score}</div>
                    <div className="text-sm text-gray-500 mt-1">Out of 100</div>
                </div>

                <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined">group</span>
                        <div className="text-sm">High-Risk Farmers</div>
                    </div>
                    <div className="text-3xl font-bold text-red-600">{riskData.high_risk_farmers_count}</div>
                    <div className="text-sm text-gray-500 mt-1">Score ≥ 70</div>
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-charcoal dark:text-off-white mb-6">System Health</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${healthData.database_status === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            <span className="material-symbols-outlined text-3xl">
                                {healthData.database_status === 'healthy' ? 'check_circle' : 'error'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">Database</div>
                        <div className="font-semibold">{healthData.database_status}</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-trust-blue/10 text-trust-blue rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">group</span>
                        </div>
                        <div className="text-sm text-gray-500">Active Users</div>
                        <div className="font-semibold">{healthData.active_users}</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-indus-green/10 text-indus-green rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">shopping_bag</span>
                        </div>
                        <div className="text-sm text-gray-500">Total Orders</div>
                        <div className="font-semibold">{healthData.total_orders}</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">schedule</span>
                        </div>
                        <div className="text-sm text-gray-500">Uptime</div>
                        <div className="font-semibold">{healthData.system_uptime}</div>
                    </div>
                </div>
            </div>

            {/* Risk Alerts Placeholder */}
            <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-charcoal dark:text-off-white mb-4">Active Risk Alerts</h2>
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">notifications</span>
                    <p className="text-gray-600 dark:text-gray-400">No active risk alerts</p>
                    <p className="text-sm text-gray-500 mt-2">System is monitoring for high-risk activities</p>
                </div>
            </div>
        </div>
    );
}
