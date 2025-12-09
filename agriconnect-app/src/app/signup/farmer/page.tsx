'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function FarmerSignup() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        cnic: '',
        district: '',
        tehsil: '',
        village: '',
        land_holding: '',
        username: '',
        password: '',
        confirm_password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await apiRequest('/farmers/signup', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.name,
                    phone_number: formData.phone_number,
                    district: formData.district,
                    tehsil: formData.tehsil,
                    village: formData.village,
                    cnic: formData.cnic,
                    land_holding: parseFloat(formData.land_holding), // Convert to float
                    username: formData.username,
                    password: formData.password
                })
            });

            // Redirect to login on success
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-off-white dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white dark:bg-container-dark rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Visual Side */}
                <div className="md:w-5/12 bg-indus-green p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-3xl">agriculture</span>
                            <span className="text-2xl font-bold tracking-tight">AgriConnect</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Join Our Farmer Community</h2>
                        <ul className="space-y-4 opacity-90">
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-300">verified</span>
                                <span>Access Credit Facilities</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-300">verified</span>
                                <span>Buy Now, Pay Later</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-300">verified</span>
                                <span>Expert Farming Advice</span>
                            </li>
                        </ul>
                    </div>

                    <div className="relative z-10 mt-12">
                        <p className="text-sm opacity-75">Already have an account?</p>
                        <Link href="/login" className="inline-block mt-2 px-6 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-indus-green transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-8 lg:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create Account</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-2 rounded">
                            <span className="material-symbols-outlined text-xl">error</span>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="Ali Khan"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNIC</label>
                                    <input
                                        name="cnic"
                                        type="text"
                                        required
                                        value={formData.cnic}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="35202-1111111-1"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        name="phone_number"
                                        type="tel"
                                        required
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="03001234567"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Farm Location */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Farm Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Land Holding (Acres)</label>
                                    <input
                                        name="land_holding"
                                        type="number"
                                        step="0.1"
                                        required
                                        value={formData.land_holding}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="12.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">district</label>
                                    <input
                                        name="district"
                                        type="text"
                                        required
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="Lahore"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">tehsil</label>
                                    <input
                                        name="tehsil"
                                        type="text"
                                        required
                                        value={formData.tehsil}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="Model Town"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">village</label>
                                    <input
                                        name="village"
                                        type="text"
                                        required
                                        value={formData.village}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="Charrar"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Account Access */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Access</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                        placeholder="ali_farmer"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                        <input
                                            name="confirm_password"
                                            type="password"
                                            required
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indus-green/50 focus:border-indus-green outline-none bg-transparent dark:text-white"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indus-green text-white py-3 rounded-xl font-bold text-lg hover:bg-indus-green/90 transition-all shadow-lg shadow-indus-green/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Create Account
                                </>
                            ) : (
                                "Register"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
