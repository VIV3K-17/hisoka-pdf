import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Upload, Download, Loader2 } from 'lucide-react';
import { FeatureLayout } from '../../components/FeatureLayout';
import { ThemeContext } from '../../context/ThemeContext';
import { splitPDF, downloadPDF, getPDFMetadata } from '../../lib/pdfUtils';

export const SplitPDF = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [splitMode, setSplitMode] = useState('all'); // 'all', 'range', 'extract'
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            const meta = await getPDFMetadata(selectedFile);
            setMetadata(meta);
            setRangeEnd(meta.pageCount);
        }
    };

    const handleSplit = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            let options = { mode: splitMode };

            if (splitMode === 'range') {
                options.range = { start: rangeStart - 1, end: rangeEnd - 1 };
            }

            const splitPdfs = await splitPDF(file, options);

            if (splitMode === 'all') {
                splitPdfs.forEach((pdf, index) => {
                    downloadPDF(pdf, `page-${index + 1}.pdf`);
                });
            } else {
                downloadPDF(splitPdfs[0], `pages-${rangeStart}-${rangeEnd}.pdf`);
            }

            setFile(null);
            setMetadata(null);
        } catch (error) {
            console.error('Error splitting PDF:', error);
            alert('Failed to split PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <FeatureLayout
            title="Split PDF"
            description="Separate one page or a whole set for easy conversion into independent PDF files"
            icon={Scissors}
            gradient="from-purple-500 to-indigo-500"
        >
            <div className="space-y-6">
                {/* Upload Area */}
                {!file ? (
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDarkMode
                            ? 'border-white/20 hover:border-white/40 bg-white/5'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}>
                        <Upload size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-400'}`} />
                        <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Select a PDF file to split
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
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-opacity"
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
                        {/* File Info */}
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                {metadata?.pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {/* Split Mode Selection */}
                        <div className="space-y-3">
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Split Mode
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSplitMode('all')}
                                    className={`p-4 rounded-xl border-2 transition-all ${splitMode === 'all'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : isDarkMode
                                                ? 'border-white/10 hover:border-white/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        All Pages
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                        Split into individual pages
                                    </p>
                                </button>
                                <button
                                    onClick={() => setSplitMode('range')}
                                    className={`p-4 rounded-xl border-2 transition-all ${splitMode === 'range'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : isDarkMode
                                                ? 'border-white/10 hover:border-white/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Page Range
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                        Extract specific range
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Range Selection */}
                        {splitMode === 'range' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Start Page
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={metadata?.pageCount}
                                        value={rangeStart}
                                        onChange={(e) => setRangeStart(parseInt(e.target.value))}
                                        className={`w-full mt-2 px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        End Page
                                    </label>
                                    <input
                                        type="number"
                                        min={rangeStart}
                                        max={metadata?.pageCount}
                                        value={rangeEnd}
                                        onChange={(e) => setRangeEnd(parseInt(e.target.value))}
                                        className={`w-full mt-2 px-4 py-2 rounded-lg border ${isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Split Button */}
                        <button
                            onClick={handleSplit}
                            disabled={isProcessing}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Splitting PDF...
                                </>
                            ) : (
                                <>
                                    <Download size={24} />
                                    Split PDF
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </div>
        </FeatureLayout>
    );
};
