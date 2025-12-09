'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface Farmer {
    id: number;
    name: string;
    phone_number: string;
    district: string;
    cnic: string;
    land_holding: number;
    credit_limit: number;
    kyc_status: string;
    approved_by_admin: boolean;
    is_blacklisted: boolean;
}

export default function AdminFarmersPage() {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const data = await apiRequest<Farmer[]>('/admin/farmers');
            setFarmers(data);
        } catch (error) {
            console.error('Failed to fetch farmers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const viewFarmerDetails = async (farmerId: number) => {
        try {
            const details = await apiRequest(`/admin/farmers/${farmerId}`);
            setSelectedFarmer(details);
        } catch (error: any) {
            alert(`Failed to fetch details: ${error.message}`);
        }
    };

    const updateCreditLimit = async (farmerId: number) => {
        const newLimit = prompt('Enter new credit limit (PKR):');
        if (!newLimit || isNaN(parseFloat(newLimit))) return;

        try {
            await apiRequest(`/admin/farmers/${farmerId}/credit-limit?new_limit=${parseFloat(newLimit)}`, {
                method: 'PUT'
            });
            alert('Credit limit updated successfully!');
            fetchFarmers();
        } catch (error: any) {
            alert(`Failed to update: ${error.message}`);
        }
    };

    const toggleBlacklist = async (farmerId: number, isBlacklisted: boolean) => {
        const endpoint = isBlacklisted ? 'unblacklist-farmer' : 'blacklist-farmer';
        const action = isBlacklisted ? 'Unblacklist' : 'Blacklist';

        if (!confirm(`Are you sure you want to ${action.toLowerCase()} this farmer?`)) return;

        try {
            await apiRequest(`/admin/${endpoint}/${farmerId}`, {
                method: 'PUT'
            });
            alert(`${action} successful!`);
            fetchFarmers();
        } catch (error: any) {
            alert(`Failed to ${action.toLowerCase()}: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">Farmers Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage farmer accounts and credit limits ({farmers.length} total)</p>
            </div>

            {/* Farmers Table */}
            <div className="bg-white dark:bg-charcoal/20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">District</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Land (Acres)</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Credit Limit</th>
                                <th className="text-center py-3 px-4 font-semibold text-sm">KYC Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmers.map((farmer) => (
                                <tr key={farmer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="py-4 px-4">
                                        <div className="font-semibold text-charcoal dark:text-off-white">{farmer.name}</div>
                                        <div className="text-sm text-gray-500">{farmer.phone_number}</div>
                                    </td>
                                    <td className="py-4 px-4 text-sm">{farmer.district}</td>
                                    <td className="py-4 px-4 text-sm">{farmer.land_holding}</td>
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-trust-blue">PKR {farmer.credit_limit.toLocaleString()}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${farmer.kyc_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            farmer.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {farmer.kyc_status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {farmer.is_blacklisted ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                Blacklisted
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => viewFarmerDetails(farmer.id)}
                                            className="px-3 py-1 bg-trust-blue text-white text-xs rounded hover:bg-trust-blue/90 mr-2"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => updateCreditLimit(farmer.id)}
                                            className="px-3 py-1 bg-indus-green text-white text-xs rounded hover:bg-indus-green/90 mr-2"
                                        >
                                            Edit Credit
                                        </button>
                                        <button
                                            onClick={() => toggleBlacklist(farmer.id, farmer.is_blacklisted)}
                                            className={`px-3 py-1 text-white text-xs rounded hover:opacity-90 ${farmer.is_blacklisted ? 'bg-green-600' : 'bg-red-600'
                                                }`}
                                        >
                                            {farmer.is_blacklisted ? 'Unblacklist' : 'Blacklist'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Farmer Details Modal */}
            {selectedFarmer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-charcoal rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-charcoal dark:text-off-white">Farmer Details</h2>
                            <button onClick={() => setSelectedFarmer(null)} className="text-gray-500 hover:text-gray-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <div className="text-sm text-gray-500">Name</div>
                                    <div className="font-semibold">{selectedFarmer.farmer.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Orders</div>
                                    <div className="font-semibold">{selectedFarmer.total_orders}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Spent</div>
                                    <div className="font-semibold text-trust-blue">PKR {selectedFarmer.total_spent.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Credit Limit</div>
                                    <div className="font-semibold text-indus-green">PKR {selectedFarmer.farmer.credit_limit.toLocaleString()}</div>
                                </div>
                            </div>

                            {selectedFarmer.risk_profile && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">Risk Profile</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Risk Score: <span className="font-semibold">{selectedFarmer.risk_profile.risk_score}</span></div>
                                        <div>Risk Label: <span className="font-semibold">{selectedFarmer.risk_profile.risk_label}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
