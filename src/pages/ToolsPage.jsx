import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Combine,
    Scissors,
    FileArchive,
    PenTool,
    Grid,
    FileText,
    Presentation,
    Sheet,
    FileType,
    SlidersHorizontal,
    FileInput
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export const ToolsPage = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    const tools = [
        {
            id: 'merge',
            icon: Combine,
            title: 'Merge PDF',
            description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
            path: '/tools/merge-pdf',
            gradient: 'from-red-500 to-pink-500'
        },
        {
            id: 'split',
            icon: Scissors,
            title: 'Split PDF',
            description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
            path: '/tools/split-pdf',
            gradient: 'from-purple-500 to-indigo-500'
        },
        {
            id: 'compress',
            icon: FileArchive,
            title: 'Compress PDF',
            description: 'Reduce file size while optimizing for maximal PDF quality.',
            path: '/tools/compress-pdf',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'handwriting',
            title: 'AI Handwriting',
            description: 'Generate realistic handwritten documents from typed text.',
            icon: PenTool,
            path: '/tools/handwriting',
            gradient: 'from-indigo-500 to-purple-500'
        },
        {
            id: 'organize',
            icon: Grid,
            title: 'Organize PDF',
            description: 'Rotate, delete, and reorder pages to organize your PDF perfectly.',
            path: '/tools/organize-pdf',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            id: 'pdf-to-word',
            icon: FileText,
            title: 'PDF to Word',
            description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.',
            path: '/tools/pdf-to-word',
            gradient: 'from-orange-500 to-amber-500'
        },
        {
            id: 'pdf-to-powerpoint',
            icon: Presentation,
            title: 'PDF to PowerPoint',
            description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
            path: '/tools/pdf-to-powerpoint',
            gradient: 'from-rose-500 to-pink-500'
        },
        {
            id: 'pdf-to-excel',
            icon: Sheet,
            title: 'PDF to Excel',
            description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
            path: '/tools/pdf-to-excel',
            gradient: 'from-teal-500 to-cyan-500'
        },
        {
            id: 'word-to-pdf',
            icon: FileInput,
            title: 'Word to PDF',
            description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
            path: '/tools/word-to-pdf',
            gradient: 'from-violet-500 to-purple-500'
        },
        {
            id: 'powerpoint-to-pdf',
            icon: FileType,
            title: 'PowerPoint to PDF',
            description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
            path: '/tools/powerpoint-to-pdf',
            gradient: 'from-fuchsia-500 to-pink-500'
        },
        {
            id: 'excel-to-pdf',
            icon: SlidersHorizontal,
            title: 'Excel to PDF',
            description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
            path: '/tools/excel-to-pdf',
            gradient: 'from-lime-500 to-green-500'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full min-h-full p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                <div className="mb-12 text-center">
                    <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        PDF Tools
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                        Choose from our comprehensive suite of PDF manipulation and conversion tools
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {tools.map((tool) => (
                        <motion.button
                            key={tool.id}
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(tool.path)}
                            className={`group relative p-6 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${isDarkMode
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl'
                                }`}
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <tool.icon size={28} className="text-white" />
                                </div>

                                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tool.title}
                                </h3>

                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                    {tool.description}
                                </p>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};
