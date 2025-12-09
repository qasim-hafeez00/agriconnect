'use client';

import { useState } from 'react';

export default function HelpPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqs = [
        {
            id: 1,
            question: 'How does the Buy Now, Pay Later (BNPL) work?',
            answer: 'Our BNPL service allows you to purchase agricultural products now and pay for them in installments. You can choose from 3, 6, or 12-month plans. The credit limit is determined based on your farm size and history.',
        },
        {
            id: 2,
            question: 'How do I increase my credit limit?',
            answer: 'Your credit limit is automatically reviewed every 6 months. Consistent on-time payments, completing your profile verification (KYC), and regular usage of the platform can help increase your limit.',
        },
        {
            id: 3,
            question: 'What happens if I miss a payment?',
            answer: 'If you miss a payment, a late fee may apply. We recommend contacting our support team immediately if you anticipate difficulty in making a payment to discuss restructuring options.',
        },
        {
            id: 4,
            question: 'How do I return a defective product?',
            answer: 'You can initiate a return request from the "My Orders" page within 3 days of delivery. The supplier will review the request and arrange for a replacement or refund.',
        },
    ];

    const contactMethods = [
        {
            icon: 'call',
            title: 'Call Us',
            info: '0800-12345',
            sub: 'Mon-Sat, 9am - 6pm',
            color: 'indus-green',
        },
        {
            icon: 'mail',
            title: 'Email Support',
            info: 'support@agriconnect.pk',
            sub: 'Response within 24 hours',
            color: 'trust-blue',
        },
        {
            icon: 'chat',
            title: 'Live Chat',
            info: 'Start Chat',
            sub: 'Available now',
            color: 'primary',
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl font-bold mb-4 text-charcoal dark:text-off-white">How can we help you?</h1>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Search for help..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-charcoal/20 focus:outline-none focus:ring-2 focus:ring-indus-green/50 shadow-sm"
                    />
                </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {contactMethods.map((method) => (
                    <div key={method.title} className="bg-white dark:bg-charcoal/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow cursor-pointer group">
                        <div className={`w-14 h-14 bg-${method.color}/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                            <span className={`material-symbols-outlined text-${method.color} text-3xl`}>{method.icon}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1 text-charcoal dark:text-off-white">{method.title}</h3>
                        <div className={`font-semibold text-${method.color} mb-1`}>{method.info}</div>
                        <div className="text-xs text-gray-500">{method.sub}</div>
                    </div>
                ))}
            </div>

            {/* FAQs */}
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-charcoal dark:text-off-white">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="bg-white dark:bg-charcoal/20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <button
                                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <span className="font-semibold text-charcoal dark:text-off-white pr-8">{faq.question}</span>
                                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${activeFaq === faq.id ? 'rotate-180' : ''
                                    }`}>
                                    expand_more
                                </span>
                            </button>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === faq.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700/50">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback Form */}
            <div className="mt-12 bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-8 text-center">
                <h3 className="font-bold text-xl mb-2 text-charcoal dark:text-off-white">Still need help?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Send us a message and we'll get back to you shortly.</p>
                <button className="px-8 py-3 bg-charcoal dark:bg-white text-white dark:text-charcoal rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Contact Support
                </button>
            </div>
        </div>
    );
}
