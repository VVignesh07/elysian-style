import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, ShoppingBag, Info, Star, ArrowRight, Headset } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "@/assets/zerofasions.in2.png";

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const WhatsAppChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string, sender: 'bot' | 'user' }[]>([
        { text: "Namaste! Welcome to Zero Fashion. How can I assist you today?", sender: 'bot' }
    ]);
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const whatsappNumber = "916369835221";
    const location = useLocation();

    // Do not show chatbot on admin pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { text, sender: 'user' }]);
        setUserInput('');

        // Predefined bot responses (advanced logic)
        setTimeout(() => {
            let response = "";
            let shouldRedirect = false;
            let internalPath = "";

            const lowerText = text.toLowerCase();

            if (lowerText.includes('track')) {
                response = "To track your order, please enter your Order ID. You can also view your order history in the 'Orders' section of your profile.";
            } else if (lowerText.includes('new') || lowerText.includes('arrival') || lowerText.includes('latest')) {
                response = "Certainly! Let me take you to our latest arrivals. One moment...";
                internalPath = "/new-in";
            } else if (lowerText.includes('sale') || lowerText.includes('discount')) {
                response = "Looking for deals? I'll show you our current sale collection.";
                internalPath = "/sale";
            } else if (lowerText.includes('style') || lowerText.includes('advice')) {
                response = "Our stylists can help you find the perfect look. Let me connect you to our expert on WhatsApp.";
                shouldRedirect = true;
            } else if (lowerText.includes('support') || lowerText.includes('help') || lowerText.includes('customer')) {
                response = "Certainly! I'm connecting you to our customer support team right now.";
                shouldRedirect = true;
            } else if (lowerText.includes('hi') || lowerText.includes('hello')) {
                response = "Hello! I'm your Zero Fashion concierge. How can I help you today?";
            } else {
                response = "I'm connecting you with our support team on WhatsApp for more detailed help.";
                shouldRedirect = true;
            }

            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);

            // Handle redirects
            if (internalPath) {
                setTimeout(() => {
                    navigate(internalPath);
                    setIsOpen(false);
                }, 2000);
            } else if (shouldRedirect) {
                setTimeout(() => {
                    const encodedMsg = encodeURIComponent(text);
                    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMsg}`, '_blank');
                }, 1500);
            }
        }, 800);
    };

    const quickActions = [
        { label: "Track My Order", icon: ShoppingBag },
        { label: "New Arrivals", icon: Star },
        { label: "Style Advice", icon: Info },
        { label: "Customer Support", icon: Headset }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-body">
            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className={cn(
                    "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                    isOpen ? "bg-white text-[#0a0a0a] rotate-90" : "bg-[#0a0a0a] text-white hover:scale-110 active:scale-95"
                )}
            >
                {isOpen ? <X size={28} /> : <WhatsAppIcon size={28} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 sm:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[350px] max-h-[calc(100vh-140px)] sm:max-h-[500px] flex flex-col bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-border animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-[#0a0a0a] p-3 sm:p-4 text-white flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                            <img src={logo} alt="ZF" className="w-full h-full object-contain p-1" />
                        </div>
                        <div>
                            <h3 className="font-body font-bold text-sm sm:text-base leading-none">Zero Fashion</h3>
                            <p className="text-[7px] sm:text-[8px] text-white/70 uppercase tracking-widest mt-1">Available 24/7</p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 min-h-[180px] max-h-[280px] overflow-y-auto p-4 space-y-3 bg-[#FDFBF9] custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-in fade-in slide-in-from-bottom-2",
                                    msg.sender === 'bot'
                                        ? "bg-white border border-border text-foreground rounded-tl-none shadow-sm"
                                        : "bg-[#0a0a0a] text-white ml-auto rounded-tr-none"
                                )}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="p-3 bg-white border-t border-border shrink-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(action.label)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-border text-xs text-foreground hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-[#0a0a0a]/5 transition-all"
                                >
                                    <action.icon size={12} />
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(userInput);
                        }}
                        className="p-3 bg-[#FDFBF9] border-t border-border flex items-center gap-2 shrink-0"
                    >
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-white border border-border rounded-full px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!userInput.trim()}
                            className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
                        >
                            <Send size={12} />
                        </button>
                    </form>

                    {/* Footer Branding */}
                    <div className="py-2 bg-white text-center">
                        <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em]">Powered by Zero Fashion</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppChatbot;
