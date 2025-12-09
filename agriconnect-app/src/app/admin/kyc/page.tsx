'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface KYCUser {
    id: number;
    name?: string;
    business_name?: string;
    district?: string;
    phone_number: string;
    kyc_status: string;
    kyc_documents?: string;
    kyc_rejection_reason?: string;
    created_at: string;
}

interface KYCData {
    farmers: KYCUser[];
    suppliers: KYCUser[];
}

export default function KYCVerificationPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>(
        (searchParams.get('tab') as any) || 'pending'
    );
    const [kycData, setKYCData] = useState<KYCData>({ farmers: [], suppliers: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchKYCData();
    }, [activeTab]);

    const fetchKYCData = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest<KYCData>(`/admin/kyc/${activeTab}`);
            setKYCData(data);
        } catch (error) {
            console.error('Failed to fetch KYC data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (type: 'farmer' | 'supplier', id: number) => {
        if (!confirm('Are you sure you want to approve this KYC submission?')) return;

        try {
            await apiRequest(`/admin/kyc/${type}/${id}/approve`, {
                method: 'PUT'
            });
            alert('KYC approved successfully!');
            fetchKYCData();
        } catch (error: any) {
            alert(`Failed to approve: ${error.message}`);
        }
    };

    const handleReject = async (type: 'farmer' | 'supplier', id: number) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await apiRequest(`/admin/kyc/${type}/${id}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT'
            });
            alert('KYC rejected!');
            fetchKYCData();
        } catch (error: any) {
            alert(`Failed to reject: ${error.message}`);
        }
    };

    const allUsers = [...kycData.farmers, ...kycData.suppliers];

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
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">KYC Verification Queue</h1>
                <p className="text-gray-600 dark:text-gray-400">Review and approve user documents</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === tab
                                ? 'text-trust-blue'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-trust-blue rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* KYC List */}
            <div className="space-y-4">
                {allUsers.length === 0 ? (
                    <div className="bg-white dark:bg-charcoal/20 rounded-xl p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">verified_user</span>
                        <h2 className="text-2xl font-semibold mb-2 text-charcoal dark:text-off-white">No submissions found</h2>
                        <p className="text-gray-600 dark:text-gray-400">No {activeTab} KYC submissions</p>
                    </div>
                ) : (
                    allUsers.map((user) => {
                        const isFarmer = 'name' in user;
                        return (
                            <div key={`${isFarmer ? 'farmer' : 'supplier'}-${user.id}`} className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isFarmer ? 'bg-indus-green/20 text-indus-green' : 'bg-trust-blue/20 text-trust-blue'
                                                }`}>
                                                {isFarmer ? 'Farmer' : 'Supplier'}
                                            </span>
                                            <h3 className="font-bold text-xl text-charcoal dark:text-off-white">
                                                {isFarmer ? (user as any).name : (user as any).business_name}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <div>
                                                <span className="font-medium">Phone:</span> {user.phone_number}
                                            </div>
                                            {(user as any).district && (
                                                <div>
                                                    <span className="font-medium">District:</span> {(user as any).district}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Submitted:</span>{' '}
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                            {user.kyc_rejection_reason && (
                                                <div className="col-span-2 text-red-600 dark:text-red-400">
                                                    <span className="font-medium">Rejection Reason:</span> {user.kyc_rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {activeTab === 'pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(isFarmer ? 'farmer' : 'supplier', user.id)}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(isFarmer ? 'farmer' : 'supplier', user.id)}
                                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">cancel</span>
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
