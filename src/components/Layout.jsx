import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Settings, SunMedium, Moon, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { OtherToolsDropdown } from './OtherToolsDropdown';

export const Layout = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    const handleNavClick = (destination) => {
        alert(`${destination} section coming soon!`);
    };

    const navButtonBase = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all';

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <div className={`min-h-screen w-full relative overflow-hidden flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-brand-dark text-brand-blue' : 'bg-white text-gray-900'}`}>
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
                <header className={`w-full h-16 border-b backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 transition-colors duration-500 ${isDarkMode ? 'border-brand-blue/10 bg-brand-dark/80 text-white' : 'border-gray-200 bg-white/80 text-gray-900'}`}>
                    <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-red to-brand-pink flex items-center justify-center shadow-lg shadow-brand-red/20">
                            <FileText size={22} className="text-white" />
                        </div>
                        <span className={`text-2xl font-bold font-['Outfit'] tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Hisoka PDF
                        </span>
                    </Link>

                    <div className="ml-auto flex items-center gap-3">
                        <OtherToolsDropdown isDarkMode={isDarkMode} />

                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(prev => !prev)}
                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg overflow-hidden ${isDarkMode ? 'bg-brand-dark border-white/10 hover:border-white/40' : 'bg-white border-gray-200 hover:border-gray-400'}`}
                                aria-haspopup="true"
                                aria-expanded={isMenuOpen}
                                aria-label="User profile menu"
                            >
                                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    VS
                                </span>
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className={`absolute right-0 top-12 w-60 rounded-2xl border shadow-2xl backdrop-blur-xl p-3 flex flex-col gap-2 ${isDarkMode ? 'bg-brand-dark/95 border-white/10' : 'bg-white border-gray-200'}`}
                                    >
                                        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-red to-brand-pink flex items-center justify-center shadow-lg text-white">
                                                <UserRound size={20} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vivek Sesetti</p>
                                                <p className={`text-xs ${isDarkMode ? 'text-brand-blue/70' : 'text-gray-500'}`}>Lead Editor</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleNavClick('Settings')}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-white hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </button>

                                        <div className={`rounded-xl px-3 py-3 flex items-center justify-between ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider font-semibold">Appearance</p>
                                                <p className="text-sm mt-1">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={toggleTheme}
                                                className={`w-14 h-7 rounded-full relative transition-colors ${isDarkMode ? 'bg-brand-red/80' : 'bg-brand-pink/70'}`}
                                                aria-pressed={!isDarkMode}
                                            >
                                                <span
                                                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${isDarkMode ? 'left-7' : 'left-0.5'}`}
                                                />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <motion.main
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 w-full h-[calc(100vh-64px)] overflow-y-auto relative"
                >
                    {children}
                </motion.main>
            </div>
        </ThemeContext.Provider>
    );
};
