import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Combine, Scissors, FileArchive, MoreHorizontal, SlidersHorizontal, PenTool } from 'lucide-react';

export const OtherToolsDropdown = ({ isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const topTools = [
        { id: 'handwriting', icon: PenTool, label: 'Handwriting Gen', path: '/tools/handwriting', highlight: true },
        { id: 'merge', icon: Combine, label: 'Merge PDF', path: '/tools/merge-pdf' },
        { id: 'split', icon: Scissors, label: 'Split PDF', path: '/tools/split-pdf' },
        { id: 'compress', icon: FileArchive, label: 'Compress PDF', path: '/tools/compress-pdf' },
    ];

    const handleToolClick = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleMoreClick = () => {
        navigate('/tools');
        setIsOpen(false);
    };

    const navButtonBase = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`${navButtonBase} ${isDarkMode ? 'text-brand-yellow bg-white/5 hover:bg-white/10' : 'text-white bg-gradient-to-r from-brand-red to-brand-pink hover:opacity-90'}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <SlidersHorizontal size={16} />
                Other Tools
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 top-12 w-60 rounded-2xl border shadow-2xl backdrop-blur-xl p-2 flex flex-col gap-1 ${isDarkMode ? 'bg-brand-dark/95 border-white/10' : 'bg-white border-gray-200'}`}
                    >
                        {topTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolClick(tool.path)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                                    } ${tool.highlight ? (isDarkMode ? 'text-brand-blue bg-brand-blue/10' : 'text-indigo-600 bg-indigo-50') : ''}`}
                            >
                                <tool.icon size={18} className={tool.highlight ? (isDarkMode ? 'text-brand-blue' : 'text-indigo-500') : 'text-brand-red'} />
                                {tool.label}
                            </button>
                        ))}

                        <div className={`h-px my-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

                        <button
                            onClick={handleMoreClick}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isDarkMode ? 'text-brand-yellow hover:bg-white/10' : 'text-brand-red hover:bg-gray-100'}`}
                        >
                            <MoreHorizontal size={18} />
                            More Tools
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
