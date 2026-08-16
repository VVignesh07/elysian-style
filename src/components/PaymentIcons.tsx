import React from 'react';

export const GPayLogo = () => (
    <div className="flex items-center gap-1">
        <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M38.8 20.4c0-1.4-.1-2.7-.4-4H20v7.6h10.6c-.5 2.5-1.9 4.6-4 5.9v4.9h6.4c3.8-3.5 6-8.6 6-14.4z" fill="#4285F4"/>
            <path d="M20 39.5c5.3 0 9.7-1.8 13-4.7l-6.4-4.9c-1.8 1.2-4.1 1.9-6.6 1.9-5.1 0-9.4-3.4-10.9-8.1H2.4v5C5.7 35.3 12.3 39.5 20 39.5z" fill="#34A853"/>
            <path d="M9.1 23.7c-.4-1.2-.6-2.4-.6-3.7s.2-2.5.6-3.7v-5H2.4C1 14.1.2 16.9.2 20s.8 5.9 2.2 8.6l6.7-4.9z" fill="#FBBC05"/>
            <path d="M20 7.6c2.9 0 5.5 1 7.5 2.9l5.6-5.6C29.7 1.8 25.3 0 20 0 12.3 0 5.7 4.2 2.4 10.7l6.7 5c1.5-4.7 5.8-8.1 10.9-8.1z" fill="#EA4335"/>
        </svg>
        <span className="text-[#3c4043] font-medium tracking-tight text-base" style={{ fontFamily: 'Product Sans, Arial, sans-serif' }}>Pay</span>
    </div>
);

export const PhonePeLogo = () => (
    <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 bg-[#5f259f] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">पे</span>
        </div>
        <span className="text-[#5f259f] font-bold tracking-tight text-sm">PhonePe</span>
    </div>
);

export const PaytmLogo = () => (
    <div className="flex items-center">
        <span className="text-[#002e6e] font-black italic tracking-tighter text-xl">Pay</span>
        <span className="text-[#00baf2] font-black italic tracking-tighter text-xl">tm</span>
    </div>
);

export const UPILogo = () => (
    <div className="flex items-center">
        <span className="text-[#0f7b3b] font-black italic text-lg tracking-tighter">U</span>
        <span className="text-[#e26a28] font-black italic text-lg tracking-tighter">P</span>
        <span className="text-[#0f7b3b] font-black italic text-lg tracking-tighter">I</span>
    </div>
);
