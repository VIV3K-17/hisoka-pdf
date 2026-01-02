import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#140f22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pb-0 flex items-start justify-between">
                            <div className="flex items-center gap-3 text-[#ce0a3a]">
                                <div className="p-2 bg-[#ce0a3a]/10 rounded-lg">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-[#ceeffe]/70 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-[#ceeffe]/60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#ce0a3a] text-white hover:bg-[#ce0a3a]/90 shadow-lg shadow-[#ce0a3a]/20 transition-all"
                            >
                                Delete Page
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
