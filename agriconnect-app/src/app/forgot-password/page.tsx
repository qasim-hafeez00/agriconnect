'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-background-dark px-4">
            <div className="max-w-md w-full bg-white dark:bg-charcoal/20 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indus-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-indus-green">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-charcoal dark:text-off-white mb-2">Forgot Password?</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indus-green focus:border-transparent outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-indus-green hover:bg-indus-green/90 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indus-green/20"
                        >
                            Send Reset Link
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
                            <p className="font-medium">Check your email!</p>
                            <p className="text-sm mt-1">We've sent a password reset link to {email}</p>
                        </div>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-indus-green font-semibold hover:underline"
                        >
                            Try another email
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-indus-green dark:hover:text-indus-green font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
