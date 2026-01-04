import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FileArchive, Upload, Download, Loader2 } from 'lucide-react';
import { FeatureLayout } from '../../components/FeatureLayout';
import { ThemeContext } from '../../context/ThemeContext';
import { compressPDF, downloadPDF } from '../../lib/pdfUtils';

export const CompressPDF = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [file, setFile] = useState(null);
    const [quality, setQuality] = useState('medium');
    const [isProcessing, setIsProcessing] = useState(false);
    const [originalSize, setOriginalSize] = useState(0);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setOriginalSize(selectedFile.size);
        }
    };

    const handleCompress = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const compressedPdf = await compressPDF(file, quality);
            downloadPDF(compressedPdf, `compressed-${file.name}`);

            const compressionRatio = ((1 - compressedPdf.length / originalSize) * 100).toFixed(1);
            alert(`PDF compressed successfully! Size reduced by ${compressionRatio}%`);

            setFile(null);
        } catch (error) {
            console.error('Error compressing PDF:', error);
            alert('Failed to compress PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const qualityOptions = [
        { value: 'low', label: 'Low Quality', description: 'Maximum compression' },
        { value: 'medium', label: 'Medium Quality', description: 'Balanced compression' },
        { value: 'high', label: 'High Quality', description: 'Minimal compression' },
    ];

    return (
        <FeatureLayout
            title="Compress PDF"
            description="Reduce file size while optimizing for maximal PDF quality"
            icon={FileArchive}
            gradient="from-blue-500 to-cyan-500"
        >
            <div className="space-y-6">
                {!file ? (
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDarkMode
                            ? 'border-white/20 hover:border-white/40 bg-white/5'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}>
                        <Upload size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-400'}`} />
                        <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Select a PDF file to compress
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
                            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-opacity"
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
                                Original size: {(originalSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Compression Quality
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {qualityOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setQuality(option.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${quality === option.value
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : isDarkMode
                                                    ? 'border-white/10 hover:border-white/20'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {option.label}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>
                                            {option.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCompress}
                            disabled={isProcessing}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Compressing PDF...
                                </>
                            ) : (
                                <>
                                    <Download size={24} />
                                    Compress PDF
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </div>
        </FeatureLayout>
    );
};
