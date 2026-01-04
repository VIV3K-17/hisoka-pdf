import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Upload, Download, Loader2, AlertCircle } from 'lucide-react';
import { FeatureLayout } from '../../components/FeatureLayout';
import { ThemeContext } from '../../context/ThemeContext';

export const PDFToPowerPoint = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [file, setFile] = useState(null);
    const [format, setFormat] = useState('pptx');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') setFile(selectedFile);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setTimeout(() => {
            alert('This feature requires backend integration. Please connect to a conversion API service.');
            setIsProcessing(false);
        }, 2000);
    };

    return (
        <FeatureLayout title="PDF to PowerPoint" description="Turn your PDF files into easy to edit PPT and PPTX slideshows" icon={Presentation} gradient="from-rose-500 to-pink-500">
            <div className="space-y-6">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                    <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Backend Integration Required</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Connect your API endpoint to enable PDF to PowerPoint conversion.</p>
                    </div>
                </div>
                {!file ? (
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDarkMode ? 'border-white/20 hover:border-white/40 bg-white/5' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
                        <Upload size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-400'}`} />
                        <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a PDF file to convert</p>
                        <input type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload" />
                        <label htmlFor="pdf-upload" className="inline-block px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-opacity">Select PDF</label>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-brand-blue/60' : 'text-gray-600'}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className="space-y-3">
                            <label className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Output Format</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['pptx', 'ppt'].map((fmt) => (
                                    <button key={fmt} onClick={() => setFormat(fmt)} className={`p-4 rounded-xl border-2 transition-all ${format === fmt ? 'border-rose-500 bg-rose-500/10' : isDarkMode ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>.{fmt.toUpperCase()}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleConvert} disabled={isProcessing} className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                            {isProcessing ? <><Loader2 size={24} className="animate-spin" />Converting...</> : <><Download size={24} />Convert to PowerPoint</>}
                        </button>
                    </motion.div>
                )}
            </div>
        </FeatureLayout>
    );
};
