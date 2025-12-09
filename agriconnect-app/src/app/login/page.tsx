'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    const roleParam = searchParams.get('role') as UserRole || 'farmer';
    const [role, setRole] = useState<UserRole>(roleParam);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            // Redirect to dashboard if already logged in
            router.push(`/${role}/dashboard`);
        }
    }, [isAuthenticated, authLoading, role, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(username, password, role);

            if (success) {
                router.push(`/${role}/dashboard`);
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const roleColors = {
        farmer: 'indus-green',
        supplier: 'trust-blue',
        admin: 'primary',
    };

    const roleIcons = {
        farmer: 'agriculture',
        supplier: 'store',
        admin: 'admin_panel_settings',
    };

    const roleNames = {
        farmer: 'Farmer',
        supplier: 'Supplier',
        admin: 'Admin',
    };

    const roleNamesUrdu = {
        farmer: 'کسان',
        supplier: 'سپلائر',
        admin: 'ایڈمن',
    };

    // Demo credentials helper
    const getDemoCredentials = () => {
        if (role === 'farmer') {
            return {
                username: 'ahmed_khan',
                password: 'password123',
                hint: 'Try: ahmed_khan or fatima_bibi',
            };
        } else if (role === 'supplier') {
            return {
                username: 'ali_fertilizers',
                password: 'password123',
                hint: 'Try: ali_fertilizers or punjab_tractors',
            };
        } else {
            return {
                username: 'admin',
                password: 'adminpassword',
                hint: 'Admin account',
            };
        }
    };

    const demoCredentials = getDemoCredentials();

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-${roleColors[role]} to-${roleColors[role]}/70 text-white p-12 flex-col justify-between`}>
                <div>
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <span className="material-symbols-outlined text-4xl">arrow_back</span>
                        <span className="text-xl font-semibold">Back to Home</span>
                    </Link>

                    <h1 className="text-5xl font-black mb-4 font-urdu">AgriConnect</h1>
                    <p className="text-2xl mb-8">{roleNames[role]} Portal</p>
                    <p className="text-xl font-urdu mb-12">{roleNamesUrdu[role]} پورٹل</p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-1">check_circle</span>
                            <div>
                                <h3 className="font-semibold text-lg">Secure Platform</h3>
                                <p className="text-white/80">Your data is encrypted and protected</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-1">check_circle</span>
                            <div>
                                <h3 className="font-semibold text-lg">Easy to Use</h3>
                                <p className="text-white/80">Simple interface in English and Urdu</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-1">check_circle</span>
                            <div>
                                <h3 className="font-semibold text-lg">24/7 Support</h3>
                                <p className="text-white/80 font-urdu">ہم ہمیشہ آپ کی مدد کے لیے موجود ہیں</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-white/70">
                    © 2024 AgriConnect. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-off-white dark:bg-background-dark">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-charcoal/20 rounded-2xl shadow-xl p-8">
                        {/* Portal Icon */}
                        <div className={`w-20 h-20 bg-${roleColors[role]}/10 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                            <span className={`material-symbols-outlined text-5xl text-${roleColors[role]}`}>
                                {roleIcons[role]}
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold text-center mb-2 text-charcoal dark:text-off-white">
                            Welcome Back
                        </h2>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                            Sign in to your {roleNames[role].toLowerCase()} account
                        </p>

                        {/* Demo Credentials Info */}
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-200 font-semibold mb-1">🔑 Test Credentials</p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                                Username: <code className="bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded">{demoCredentials.username}</code>
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Password: <code className="bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded">{demoCredentials.password}</code>
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{demoCredentials.hint}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-alert-red/10 border border-alert-red/30 rounded-lg">
                                <p className="text-sm text-alert-red">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selector */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-charcoal dark:text-off-white">
                                    Login As
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['farmer', 'supplier', 'admin'] as UserRole[]).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`p-3 rounded-lg border-2 transition-all ${role === r
                                                ? `border-${roleColors[r]} bg-${roleColors[r]}/10`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined mb-1 ${role === r ? `text-${roleColors[r]}` : 'text-gray-400'}`}>
                                                {roleIcons[r]}
                                            </span>
                                            <div className={`text-xs font-medium ${role === r ? `text-${roleColors[r]}` : 'text-gray-600 dark:text-gray-400'}`}>
                                                {roleNames[r]}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-2 text-charcoal dark:text-off-white">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-charcoal dark:text-off-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter your username"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2 text-charcoal dark:text-off-white">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-charcoal dark:text-off-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 rounded-lg font-semibold text-white bg-${roleColors[role]} hover:bg-${roleColors[role]}/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                {role === 'farmer' ? (
                                    <Link href="/signup/farmer" className="text-indus-green font-semibold hover:underline">
                                        Sign up as Farmer
                                    </Link>
                                ) : role === 'supplier' ? (
                                    <Link href="/supplier_registration_form" className="text-trust-blue font-semibold hover:underline">
                                        Register as Supplier
                                    </Link>
                                ) : (
                                    <span className="text-gray-400">Contact System Administrator</span>
                                )}
                            </p>
                            <Link href="/" className="text-sm text-primary hover:underline block">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
