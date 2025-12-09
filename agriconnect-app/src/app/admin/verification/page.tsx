'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

// Reusing types from API response
interface KYCUser {
    id: number;
    username: string;
    email?: string;
    phone_number: string;
    kyc_status: string;
    approved_by_admin: boolean;
    created_at: string;
    // Farmer specific
    name?: string;
    farm_name?: string;
    land_holding?: number;
    district?: string;
    // Supplier specific
    business_name?: string;
    business_type?: string;
}

export default function KYCVerificationPage() {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [farmers, setFarmers] = useState<KYCUser[]>([]);
    const [suppliers, setSuppliers] = useState<KYCUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchKYCData();
        fetchStats();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const data = await apiRequest<any>('/admin/dashboard/stats');
            setStats({
                pending: data.pending_reviews,
                approved: data.approved,
                rejected: data.rejected
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Fallback stats if API fails
            setStats({ pending: 0, approved: 0, rejected: 0 });
        }
    };

    const fetchKYCData = async () => {
        setIsLoading(true);
        try {
            // Mapping UI tab names to API endpoints if necessary
            const endpoint = `/admin/kyc/${activeTab}`;
            const data = await apiRequest<{ farmers: KYCUser[], suppliers: KYCUser[] }>(endpoint);
            setFarmers(data.farmers);
            setSuppliers(data.suppliers);
        } catch (error) {
            console.error('Failed to fetch KYC data:', error);
            setFarmers([]);
            setSuppliers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (user: KYCUser, type: 'farmer' | 'supplier') => {
        const name = user.name || user.business_name || user.username;
        if (!confirm(`Are you sure you want to approve ${name}?`)) return;

        try {
            const endpoint = type === 'farmer'
                ? `/admin/kyc/farmer/${user.id}/approve`
                : `/admin/kyc/supplier/${user.id}/approve`;

            await apiRequest(endpoint, { method: 'PUT' });
            alert('User approved successfully!');
            fetchKYCData();
            fetchStats();
        } catch (error: any) {
            alert(`Failed to approve: ${error.message}`);
        }
    };

    const handleReject = async (user: KYCUser, type: 'farmer' | 'supplier') => {
        const name = user.name || user.business_name || user.username;
        const reason = prompt(`Enter rejection reason for ${name}:`);
        if (!reason) return;

        try {
            const endpoint = type === 'farmer'
                ? `/admin/kyc/farmer/${user.id}/reject?reason=${encodeURIComponent(reason)}`
                : `/admin/kyc/supplier/${user.id}/reject?reason=${encodeURIComponent(reason)}`;

            await apiRequest(endpoint, { method: 'PUT' });
            alert('User rejected successfully!');
            fetchKYCData();
            fetchStats();
        } catch (error: any) {
            alert(`Failed to reject: ${error.message}`);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">KYC Verification Queue</h1>
                <p className="text-gray-600 dark:text-gray-400">Review and approve user documents</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div onClick={() => setActiveTab('pending')} className={`cursor-pointer bg-white dark:bg-charcoal/20 rounded-xl p-6 border transition-all ${activeTab === 'pending' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-yellow-600 text-2xl">pending_actions</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${activeTab === 'pending' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Active</span>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white mb-1">{stats.pending}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
                </div>

                <div onClick={() => setActiveTab('approved')} className={`cursor-pointer bg-white dark:bg-charcoal/20 rounded-xl p-6 border transition-all ${activeTab === 'approved' ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white mb-1">{stats.approved}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Approved Users</div>
                </div>

                <div onClick={() => setActiveTab('rejected')} className={`cursor-pointer bg-white dark:bg-charcoal/20 rounded-xl p-6 border transition-all ${activeTab === 'rejected' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600 text-2xl">cancel</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-charcoal dark:text-off-white mb-1">{stats.rejected}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rejected Users</div>
                </div>
            </div>

            {/* List Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Farmers Section */}
                    {farmers.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300">Farmers ({farmers.length})</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {farmers.map(user => (
                                    <UserCard key={user.id} user={user} type="farmer" onApprove={handleApprove} onReject={handleReject} isPending={activeTab === 'pending'} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suppliers Section */}
                    {suppliers.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300">Suppliers ({suppliers.length})</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {suppliers.map(user => (
                                    <UserCard key={user.id} user={user} type="supplier" onApprove={handleApprove} onReject={handleReject} isPending={activeTab === 'pending'} />
                                ))}
                            </div>
                        </div>
                    )}

                    {farmers.length === 0 && suppliers.length === 0 && (
                        <div className="bg-white dark:bg-charcoal/20 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">inbox</span>
                            <h2 className="text-2xl font-semibold mb-2 text-charcoal dark:text-off-white">No {activeTab} applications</h2>
                            <p className="text-gray-600 dark:text-gray-400">There are no users in this category currently.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function UserCard({ user, type, onApprove, onReject, isPending }: { user: KYCUser, type: 'farmer' | 'supplier', onApprove: any, onReject: any, isPending: boolean }) {
    const displayName = user.name || user.business_name || user.username;

    return (
        <div className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'farmer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        <span className="material-symbols-outlined text-2xl">
                            {type === 'farmer' ? 'agriculture' : 'store'}
                        </span>
                    </div>
                    <div>
                        <div className="font-semibold text-lg text-charcoal dark:text-off-white">{displayName}</div>
                        <div className="text-sm text-gray-500 capitalize">{type} • {user.district || user.email}</div>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.kyc_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        user.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {user.kyc_status}
                </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">{user.phone_number}</span>
                </div>
                {type === 'farmer' && (
                    <div className="flex justify-between">
                        <span>Farm Name:</span>
                        <span className="font-medium">{user.farm_name || 'N/A'}</span>
                    </div>
                )}
                {type === 'supplier' && (
                    <div className="flex justify-between">
                        <span>Business Type:</span>
                        <span className="font-medium">{user.business_type || 'N/A'}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Joined:</span>
                    <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {isPending && (
                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => onApprove(user, type)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Approve
                    </button>
                    <button
                        onClick={() => onReject(user, type)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
}
