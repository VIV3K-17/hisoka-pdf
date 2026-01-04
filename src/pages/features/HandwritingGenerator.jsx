import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Download, Type, FileText, Settings, RefreshCw, AlignLeft } from 'lucide-react';
import { FeatureLayout } from '../../components/FeatureLayout';
import { ThemeContext } from '../../context/ThemeContext';
import { PDFDocument } from 'pdf-lib';

export const HandwritingGenerator = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const canvasRef = useRef(null);
    const [text, setText] = useState('Start typing to see your handwriting...');
    const [selectedFont, setSelectedFont] = useState('Braden Hill');
    const [paperType, setPaperType] = useState('plain');
    const [inkColor, setInkColor] = useState('#1a1a2e');
    const [density, setDensity] = useState(50); // 0-100
    const [misalignment, setMisalignment] = useState(30); // 0-100
    const [isGenerating, setIsGenerating] = useState(false);

    const fonts = [
        { name: 'Braden Hill', family: 'Braden Hill' },
        { name: 'Caroline', family: 'Caroline' },
        { name: 'Donald Ross', family: 'Donald Ross' },
        { name: 'Sam Roberts', family: 'Sam Roberts' },
        { name: 'Scott Williams', family: 'Scott Williams' },
        { name: 'Tony Flores', family: 'Tony Flores' },
        { name: 'Victor Read', family: 'Victor Read' },
    ];

    const papers = [
        { id: 'plain', name: 'Plain White', css: 'bg-white' },
        { id: 'lined', name: 'Lined Paper', css: 'bg-white', style: { backgroundImage: 'linear-gradient(#999 1px, transparent 1px)', backgroundSize: '100% 2rem' } },
        { id: 'grid', name: 'Grid Paper', css: 'bg-white', style: { backgroundImage: 'linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)', backgroundSize: '20px 20px' } },
    ];

    useEffect(() => {
        renderCanvas();
    }, [text, selectedFont, paperType, inkColor, density, misalignment]);

    const renderCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = 794; // A4 width at 96 DPI
        const height = 1123; // A4 height at 96 DPI

        canvas.width = width;
        canvas.height = height;

        // Draw Paper Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (paperType === 'lined') {
            ctx.beginPath();
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            const lineHeight = 30;
            for (let y = 100; y < height; y += lineHeight) {
                ctx.moveTo(40, y);
                ctx.lineTo(width - 40, y);
            }
            ctx.stroke();
            // Margin line
            ctx.beginPath();
            ctx.strokeStyle = '#fca5a5';
            ctx.moveTo(60, 0);
            ctx.lineTo(60, height);
            ctx.stroke();
        } else if (paperType === 'grid') {
            ctx.beginPath();
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            const gridSize = 20;
            for (let x = 0; x < width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        }

        // Configure Text
        const BASE_FONT_SIZE = 24;
        const fontScale = 1 + ((50 - density) / 100); // Inverse density affects size/spacing
        const fontSize = BASE_FONT_SIZE * fontScale;
        const lineHeight = fontSize * 1.5;

        ctx.font = `${fontSize}px "${selectedFont}"`;
        ctx.fillStyle = inkColor;
        ctx.textBaseline = 'top';

        const words = text.split(/\s+/);
        let currentX = 80;
        let currentY = 100;
        const maxWidth = width - 80;

        // Draw Text with Misalignment
        words.forEach(word => {
            const wordWidth = ctx.measureText(word + ' ').width;

            if (currentX + wordWidth > maxWidth) {
                currentX = 80;
                currentY += lineHeight;
            }

            // Misalignment Logic
            const randomX = (Math.random() - 0.5) * (misalignment / 10);
            const randomY = (Math.random() - 0.5) * (misalignment / 10);
            const randomRot = (Math.random() - 0.5) * (misalignment / 1000); // Subtle rotation

            ctx.save();
            ctx.translate(currentX + randomX, currentY + randomY);
            ctx.rotate(randomRot);
            ctx.fillText(word, 0, 0);
            ctx.restore();

            currentX += wordWidth;
        });
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const canvas = canvasRef.current;
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([canvas.width, canvas.height]);
            const image = await pdfDoc.embedPng(canvas.toDataURL());

            page.drawImage(image, {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'handwritten-note.pdf';
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <FeatureLayout
            title="AI Handwriting Generator"
            description="Transform typed text into realistic handwritten documents"
            icon={PenTool}
            gradient="from-indigo-500 to-purple-500"
        >
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Controls Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Text Input */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Type size={16} /> Input Text
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className={`w-full h-32 px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue ${isDarkMode ? 'bg-black/20 text-white' : 'bg-gray-50 text-gray-900'
                                }`}
                            placeholder="Type your text here..."
                        />
                    </div>

                    {/* Style Controls */}
                    <div className={`p-4 rounded-xl border space-y-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <PenTool size={16} /> Font Style
                            </label>
                            <select
                                value={selectedFont}
                                onChange={(e) => setSelectedFont(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue ${isDarkMode ? 'bg-black/20 text-white' : 'bg-gray-50 text-gray-900'
                                    }`}
                            >
                                {fonts.map(font => (
                                    <option key={font.name} value={font.family}>{font.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <FileText size={16} /> Paper Type
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {papers.map(paper => (
                                    <button
                                        key={paper.id}
                                        onClick={() => setPaperType(paper.id)}
                                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${paperType === paper.id
                                                ? 'border-brand-blue bg-brand-blue/10'
                                                : isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {paper.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <AlignLeft size={16} /> Density & Spacing
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={density}
                                onChange={(e) => setDensity(Number(e.target.value))}
                                className="w-full accent-brand-blue"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <RefreshCw size={16} /> Human Inconsistency
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={misalignment}
                                onChange={(e) => setMisalignment(Number(e.target.value))}
                                className="w-full accent-brand-blue"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        {isGenerating ? 'Generating...' : (
                            <>
                                <Download size={20} /> Download PDF
                            </>
                        )}
                    </button>
                </div>

                {/* Live Preview */}
                <div className="flex-1 min-h-[500px] bg-gray-900/50 rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-white/10">
                    <div className="relative shadow-2xl overflow-hidden rounded-sm" style={{ aspectRatio: '210/297', height: '100%' }}>
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full object-contain bg-white"
                        />
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
};
