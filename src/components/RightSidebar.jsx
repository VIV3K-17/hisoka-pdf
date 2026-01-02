import React from 'react';
import { motion } from 'framer-motion';
import {
    Grid,
    Image as ImageIcon,
    FileType,
    Scissors,
    Combine,
    Eraser,
    PenTool,
    ChevronLeft,
    ChevronRight,
    ArrowRightLeft,
    RotateCw
} from 'lucide-react';
import { cn } from '../lib/utils';

export const RightSidebar = ({
    isOpen,
    toggleSidebar,
    onToolClick,
    activeTool
}) => {
    const tools = [
        { id: 'organize', icon: Grid, label: 'Organize PDF' },
        { id: 'image-to-pdf', icon: ImageIcon, label: 'Image to PDF' },
        { id: 'pdf-to-image', icon: FileType, label: 'PDF to Image' },
        { id: 'split', icon: Scissors, label: 'Split PDF' },
        { id: 'merge', icon: Combine, label: 'Merge PDFs' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
        { id: 'signature', icon: PenTool, label: 'Add Signature' },
    ];

    return (
        <motion.div
            animate={{ width: isOpen ? 280 : 0 }}
            className="h-full border-l border-brand-blue/10 bg-brand-dark flex flex-col relative transition-all duration-300 z-20"
        >
            <button
                onClick={toggleSidebar}
                className="absolute -left-3 top-6 bg-brand-red rounded-full p-1 hover:bg-brand-pink transition-colors z-30 shadow-lg"
            >
                {isOpen ? <ChevronRight size={16} className="text-white" /> : <ChevronLeft size={16} className="text-white" />}
            </button>

            <div className="p-4 flex flex-col gap-4 h-full overflow-hidden">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-brand-blue/10 min-w-max">
                    <span className="text-xs font-bold text-brand-blue/40 uppercase tracking-widest">
                        Quick Actions
                    </span>
                </div>

                <div className="flex flex-col gap-2 min-w-max">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => onToolClick(tool.id)}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-left",
                                activeTool === tool.id
                                    ? "bg-gradient-to-r from-brand-red/20 to-brand-pink/20 text-white border border-brand-red/50"
                                    : "hover:bg-white/5 text-brand-blue/60 hover:text-white"
                            )}
                        >
                            <tool.icon size={20} className={cn("shrink-0 relative z-10", activeTool === tool.id && "text-brand-red")} />
                            <span className="font-medium relative z-10 text-sm">
                                {tool.label}
                            </span>
                            {activeTool === tool.id && (
                                <motion.div
                                    layoutId="rightActiveTab"
                                    className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-brand-pink/10"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Additional Info or Controls can go here */}
            </div>
        </motion.div>
    );
};
