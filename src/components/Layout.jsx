import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Home, Settings, HelpCircle, Layers } from 'lucide-react';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-brand-dark text-brand-blue relative overflow-hidden flex flex-col">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-20 bg-brand-red"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-20 bg-brand-pink"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Header */}
            <header className="w-full h-16 border-b border-brand-blue/10 bg-brand-dark/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-red to-brand-pink flex items-center justify-center shadow-lg shadow-brand-red/20">
                        <FileText size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold font-['Outfit'] tracking-wide text-white">
                        Hisoka PDF
                    </span>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { name: 'Dashboard', icon: Home },
                        { name: 'Features', icon: Layers },
                        { name: 'Settings', icon: Settings },
                        { name: 'Help', icon: HelpCircle }
                    ].map((item) => (
                        <button
                            key={item.name}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-brand-blue/70 hover:text-brand-yellow hover:bg-white/5 transition-all"
                        >
                            <item.icon size={16} />
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ceeffe]/10 border border-[#ceeffe]/20" />
                </div>
            </header>

            {/* Main Content Area */}
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 w-full h-[calc(100vh-64px)] overflow-hidden relative"
            >
                {children}
            </motion.main>
        </div>
    );
};
