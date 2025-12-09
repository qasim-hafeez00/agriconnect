'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface Supplier {
    id: number;
    business_name: string;
    email: string;
    phone_number: string;
    kyc_status: string;
    approved_by_admin: boolean;
}

export default function AdminSuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const data = await apiRequest<Supplier[]>('/admin/suppliers');
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
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

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal dark:text-off-white mb-2">Suppliers Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage supplier accounts ({suppliers.length} total)</p>
            </div>

            <div className="bg-white dark:bg-charcoal/20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Business Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Contact</th>
                                <th className="text-center py-3 px-4 font-semibold text-sm">KYC Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-sm">Approval</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="py-4 px-4">
                                        <div className="font-semibold text-charcoal dark:text-off-white">{supplier.business_name}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-sm">{supplier.email}</div>
                                        <div className="text-sm text-gray-500">{supplier.phone_number}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${supplier.kyc_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                supplier.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {supplier.kyc_status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {supplier.approved_by_admin ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
