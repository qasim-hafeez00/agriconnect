'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OTPVerificationPage() {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length === 6) {
            // Mock verification
            alert(`Verifying code: ${code}`);
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-background-dark px-4">
            <div className="max-w-md w-full bg-white dark:bg-charcoal/20 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-trust-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-trust-blue">sms</span>
                    </div>
                    <h1 className="text-2xl font-bold text-charcoal dark:text-off-white mb-2">Verify Your Phone</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        We've sent a 6-digit code to your phone number ending in ****-1234
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-center gap-2 sm:gap-4">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-trust-blue focus:border-transparent outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={otp.join('').length !== 6}
                        className="w-full py-3 px-4 bg-trust-blue hover:bg-trust-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg shadow-trust-blue/20"
                    >
                        Verify Code
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Didn't receive the code?</p>
                    {timeLeft > 0 ? (
                        <span className="text-gray-400">Resend in 00:{timeLeft.toString().padStart(2, '0')}</span>
                    ) : (
                        <button
                            onClick={() => setTimeLeft(30)}
                            className="text-trust-blue font-semibold hover:underline"
                        >
                            Resend Code
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
