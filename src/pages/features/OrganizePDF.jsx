import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Grid, Upload, Download, Loader2, RotateCw, Trash2 } from 'lucide-react';
import { FeatureLayout } from '../../components/FeatureLayout';
import { ThemeContext } from '../../context/ThemeContext';
import { organizePDF, downloadPDF, getPDFMetadata } from '../../lib/pdfUtils';

export const OrganizePDF = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [pages, setPages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            const meta = await getPDFMetadata(selectedFile);
            setMetadata(meta);

            // Initialize pages array
            const pagesArray = Array.from({ length: meta.pageCount }, (_, i) => ({
                pageIndex: i,
                rotation: 0,
                action: 'keep'
            }));
            setPages(pagesArray);
        }
    };

    const rotatePage = (index) => {
        setPages(prev => prev.map((page, i) =>
            i === index ? { ...page, rotation: (page.rotation + 90) % 360 } : page
        ));
    };

    const deletePage = (index) => {
        setPages(prev => prev.map((page, i) =>
            i === index ? { ...page, action: 'delete' } : page
        ));
    };

    const restorePage = (index) => {
        setPages(prev => prev.map((page, i) =>
            i === index ? { ...page, action: 'keep' } : page
        ));
    };

    const handleOrganize = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const organizedPdf = await organizePDF(file, pages);
            downloadPDF(organizedPdf, `organized-${file.name}`);
            setFile(null);
            setPages([]);
        } catch (error) {
            console.error('Error organizing PDF:', error);
            alert('Failed to organize PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <FeatureLayout
            title="Organize PDF"
            description="Rotate, delete, and reorder pages to organize your PDF perfectly"
            icon={Grid}
            gradient="from-green-500 to-emerald-500"
        >
            <div className="space-y-6">
                {!file ? (
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDarkMode
                            ? 'border-white/20 hover:border-white/40 bg-white/5'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}>
                        <Upload size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-400'}`} />
                        <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Select a PDF file to organize
                        </p>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label
                            htmlFor="pdf-upload"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            Select PDF
                        </label>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                {metadata?.pageCount} pages
                            </p>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                            {pages.map((page, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: page.action === 'delete' ? 0.3 : 1, scale: 1 }}
                                    className={`relative p-3 rounded-xl border ${page.action === 'delete'
                                            ? 'border-red-500/50 bg-red-500/10'
                                            : isDarkMode
                                                ? 'border-white/10 bg-white/5'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div
                                        className={`aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-2 flex items-center justify-center`}
                                        style={{ transform: `rotate(${page.rotation}deg)` }}
                                    >
                                        <span className="text-white text-2xl font-bold">{index + 1}</span>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => rotatePage(index)}
                                            className={`flex-1 p-1.5 rounded ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                                            title="Rotate"
                                        >
                                            <RotateCw size={14} className={isDarkMode ? 'text-white' : 'text-gray-700'} />
                                        </button>
                                        {page.action === 'delete' ? (
                                            <button
                                                onClick={() => restorePage(index)}
                                                className="flex-1 p-1.5 rounded bg-green-500/20 hover:bg-green-500/30"
                                                title="Restore"
                                            >
                                                <span className="text-xs text-green-400">↺</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => deletePage(index)}
                                                className={`flex-1 p-1.5 rounded ${isDarkMode ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-red-50 hover:bg-red-100'}`}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={handleOrganize}
                            disabled={isProcessing}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Organizing PDF...
                                </>
                            ) : (
                                <>
                                    <Download size={24} />
                                    Save Organized PDF
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </div>
        </FeatureLayout>
    );
};
