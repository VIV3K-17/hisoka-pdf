import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const DragDropUpload = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                return;
            }
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                return;
            }
            onFileSelect(file);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8">
            <motion.div
                layout
                className={cn(
                    "glass-card relative overflow-hidden p-16 text-center cursor-pointer transition-all duration-500 group border-2",
                    isDragging ? "border-indigo-400 bg-white/10 scale-105" : "border-white/10 hover:border-indigo-500/50 hover:bg-white/5",
                    error ? "border-red-400/50" : ""
                )}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
            >
                {/* Animated Gradient Background */}
                <motion.div
                    className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15), transparent)',
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer opacity-50" />

                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleChange}
                />

                <AnimatePresence mode='wait'>
                    {error ? (
                        <motion.div
                            key="error"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-red-300"
                        >
                            <div className="p-5 rounded-2xl bg-red-500/20 ring-2 ring-red-500/50 shadow-lg shadow-red-500/20">
                                <AlertCircle size={56} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">Invalid File</h3>
                                <p className="text-sm opacity-80">{error}</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setError(null); }}
                                    className="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <motion.div
                                className={cn(
                                    "p-8 rounded-3xl bg-gradient-to-br transition-all duration-500 shadow-2xl",
                                    isDragging
                                        ? "from-indigo-500/30 to-purple-500/30 ring-4 ring-indigo-400/50 scale-110"
                                        : "from-white/5 to-white/10 ring-2 ring-white/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 group-hover:ring-indigo-400/30"
                                )}
                                animate={isDragging ? {
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, -5, 0]
                                } : {}}
                                transition={{ repeat: isDragging ? Infinity : 0, duration: 2 }}
                            >
                                <UploadCloud size={80} className={cn(
                                    "transition-colors duration-300",
                                    isDragging ? "text-indigo-300" : "text-gray-300 group-hover:text-indigo-300"
                                )} />
                            </motion.div>

                            <div className="space-y-3">
                                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
                                    {isDragging ? 'Drop your PDF here' : 'Click or Drag PDF'}
                                </h3>
                                <p className="text-gray-400 text-base">
                                    Analyze handwriting, edit, and reimagine your documents with AI.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>Supports PDF files only</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
