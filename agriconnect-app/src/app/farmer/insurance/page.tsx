'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface InsurancePlan {
    id: number;
    title: string;
    provider: string;
    coverage_amount: number;
    premium_amount: number;
    premium_period: string;
    description: string;
    icon: string;
    color: string;
    features: string;
    is_active: boolean;
}

interface InsurancePolicy {
    id: number;
    farmer_id: number;
    plan_id: number;
    policy_number: string;
    start_date: string;
    end_date: string;
    status: string;
    premium_paid: number;
    next_payment_date: string | null;
    claim_amount: number | null;
    claim_status: string | null;
}

export default function InsurancePage() {
    const [activeTab, setActiveTab] = useState<'available' | 'my-policies'>('available');
    const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
    const [myPolicies, setMyPolicies] = useState<InsurancePolicy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [plans, policies] = await Promise.all([
                apiRequest<InsurancePlan[]>('/insurance/plans'),
                apiRequest<InsurancePolicy[]>('/insurance/my-policies')
            ]);
            setInsurancePlans(plans);
            setMyPolicies(policies);
        } catch (error) {
            console.error('Failed to fetch insurance data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async (planId: number) => {
        setIsApplying(planId);
        try {
            await apiRequest(`/insurance/apply/${planId}`, {
                method: 'POST'
            });
            alert('Insurance application submitted successfully!');
            await fetchData();
            setActiveTab('my-policies');
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to apply for insurance';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsApplying(null);
        }
    };

    const handleFileClaim = async (policyId: number) => {
        const claimAmount = prompt('Enter claim amount (PKR):');
        if (!claimAmount || isNaN(parseFloat(claimAmount))) {
            alert('Invalid claim amount');
            return;
        }

        try {
            await apiRequest(`/insurance/claim/${policyId}?claim_amount=${parseFloat(claimAmount)}`, {
                method: 'POST'
            });
            alert('Claim filed successfully! It will be reviewed by the insurance provider.');
            await fetchData();
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to file claim';
            alert(`Error: ${errorMessage}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indus-green"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-charcoal dark:text-off-white">Insurance & Protection</h1>
                <p className="text-gray-600 dark:text-gray-400">Secure your farm, crops, and livestock</p>
            </div>

            <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'available'
                        ? 'text-indus-green'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Available Plans
                    {activeTab === 'available' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indus-green rounded-t-full"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('my-policies')}
                    className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'my-policies'
                        ? 'text-indus-green'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    My Policies ({myPolicies.length})
                    {activeTab === 'my-policies' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indus-green rounded-t-full"></span>
                    )}
                </button>
            </div>

            {activeTab === 'available' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insurancePlans.map((plan) => {
                        const features = plan.features.split(',');
                        return (
                            <div key={plan.id} className="bg-white dark:bg-charcoal/20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                <div className={`bg-${plan.color}/10 p-6 flex items-center gap-4`}>
                                    <div className={`w-12 h-12 bg-white dark:bg-charcoal rounded-full flex items-center justify-center shadow-sm`}>
                                        <span className={`material-symbols-outlined text-${plan.color} text-2xl`}>{plan.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-charcoal dark:text-off-white">{plan.title}</h3>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{plan.provider}</div>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{plan.description}</p>
                                    <div className="space-y-3 mb-6 flex-1">
                                        {features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-500">Coverage</span>
                                            <span className="font-semibold">PKR {plan.coverage_amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Premium</span>
                                            <span className="font-bold text-indus-green">PKR {plan.premium_amount.toLocaleString()} / {plan.premium_period}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApply(plan.id)}
                                        disabled={isApplying === plan.id}
                                        className="w-full py-3 bg-indus-green text-white rounded-lg hover:bg-indus-green/90 font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {isApplying === plan.id ? 'Applying...' : 'Get Quote'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {myPolicies.length === 0 ? (
                        <div className="bg-white dark:bg-charcoal/20 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">shield</span>
                            <h2 className="text-2xl font-semibold mb-2 text-charcoal dark:text-off-white">No policies yet</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Browse available plans and apply for insurance</p>
                            <button
                                onClick={() => setActiveTab('available')}
                                className="px-6 py-3 bg-indus-green text-white rounded-lg hover:bg-indus-green/90 font-semibold"
                            >
                                View Available Plans
                            </button>
                        </div>
                    ) : (
                        myPolicies.map((policy) => {
                            const plan = insurancePlans.find(p => p.id === policy.plan_id);
                            if (!plan) return null;

                            return (
                                <div key={policy.id} className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className={`w-16 h-16 bg-${plan.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <span className={`material-symbols-outlined text-${plan.color} text-3xl`}>{plan.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-1">
                                            <h3 className="font-bold text-xl text-charcoal dark:text-off-white">{plan.title}</h3>
                                            <span className={`px-3 py-1 text-xs rounded-full font-semibold uppercase ${policy.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                                                }`}>
                                                {policy.status}
                                            </span>
                                            {policy.claim_status && (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs rounded-full font-semibold uppercase">
                                                    Claim: {policy.claim_status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-2">{plan.provider} • Policy #{policy.policy_number}</div>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 block">Start Date</span>
                                                <span className="font-medium">{new Date(policy.start_date).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">End Date</span>
                                                <span className="font-medium">{new Date(policy.end_date).toLocaleDateString()}</span>
                                            </div>
                                            {policy.next_payment_date && (
                                                <div>
                                                    <span className="text-gray-500 block">Next Payment</span>
                                                    <span className="font-medium">{new Date(policy.next_payment_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleFileClaim(policy.id)}
                                            disabled={policy.status !== 'ACTIVE' || policy.claim_status === 'PENDING'}
                                            className="flex-1 md:flex-none px-4 py-2 bg-indus-green text-white rounded-lg hover:bg-indus-green/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            File Claim
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
