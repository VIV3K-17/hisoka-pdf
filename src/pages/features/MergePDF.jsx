import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Combine, Upload, X, GripVertical, Download, Loader2 } from 'lucide-react';
import { FeatureLayout } from '../../components/FeatureLayout';
import { ThemeContext } from '../../context/ThemeContext';
import { mergePDFs, downloadPDF } from '../../lib/pdfUtils';

export const MergePDF = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(
            file => file.type === 'application/pdf'
        );
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'application/pdf'
        );
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex === null || draggedIndex === index) return;

        const newFiles = [...files];
        const draggedFile = newFiles[draggedIndex];
        newFiles.splice(draggedIndex, 1);
        newFiles.splice(index, 0, draggedFile);
        setFiles(newFiles);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleMerge = async () => {
        if (files.length < 2) return;

        setIsProcessing(true);
        try {
            const mergedPdf = await mergePDFs(files);
            downloadPDF(mergedPdf, 'merged-document.pdf');
            setFiles([]);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Failed to merge PDFs. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <FeatureLayout
            title="Merge PDF"
            description="Combine PDFs in the order you want with the easiest PDF merger available"
            icon={Combine}
            gradient="from-red-500 to-pink-500"
        >
            <div className="space-y-6">
                {/* Upload Area */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDarkMode
                        ? 'border-white/20 hover:border-white/40 bg-white/5'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}
                >
                    <Upload size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-400'}`} />
                    <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Drop PDF files here or click to browse
                    </p>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                        Select multiple PDF files to merge
                    </p>
                    <input
                        type="file"
                        multiple
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="pdf-upload"
                    />
                    <label
                        htmlFor="pdf-upload"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        Select PDFs
                    </label>
                </div>

                {/* File List */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Files to merge ({files.length})
                            </h3>
                            {files.map((file, index) => (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-move ${isDarkMode
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <GripVertical size={20} className={isDarkMode ? 'text-brand-blue/40' : 'text-gray-400'} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {file.name}
                                        </p>
                                        <p className={`text-sm ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className={`p-2 rounded-lg transition-colors ${isDarkMode
                                            ? 'hover:bg-red-500/20 text-red-400'
                                            : 'hover:bg-red-50 text-red-600'
                                            }`}
                                    >
                                        <X size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Merge Button */}
                {files.length >= 2 && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleMerge}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                Merging PDFs...
                            </>
                        ) : (
                            <>
                                <Download size={24} />
                                Merge {files.length} PDFs
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </FeatureLayout>
    );
};
