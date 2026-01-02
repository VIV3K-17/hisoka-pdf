import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PageThumbnail = ({
    pageNumber,
    totalPages,
    onRotate,
    onDelete,
    isSelected,
    onClick
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
                "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                isSelected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-white/30"
            )}
            onClick={onClick}
        >
            {/* Drag Handle */}
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 bg-black/50 rounded cursor-move">
                    <GripVertical size={16} className="text-white" />
                </div>
            </div>

            {/* Page Number Badge */}
            <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-black/70 rounded text-xs font-semibold text-white">
                {pageNumber} / {totalPages}
            </div>

            {/* Thumbnail Preview - Placeholder */}
            <div className="aspect-[8.5/11] bg-white flex items-center justify-center text-gray-400">
                <span className="text-4xl font-bold">{pageNumber}</span>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 justify-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotate();
                    }}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    title="Rotate 90°"
                >
                    <RotateCw size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    title="Delete Page"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
};
