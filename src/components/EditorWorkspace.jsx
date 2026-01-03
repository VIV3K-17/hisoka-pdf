import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdfjs } from 'react-pdf';
import {
    Settings,
    Type,
    PenTool,
    Palette,
    Eraser,
    Highlighter,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Download,
    Maximize,
    Grid,
    Layout as LayoutIcon,
    Image as ImageIcon,
    Undo2,
    Redo2,
    Trash2,
    Square
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PDFViewer } from '../features/pdf/PDFViewer';
import { HANDWRITING_FONTS, PAPER_TYPES } from '../features/handwriting/constants';
import { HandwritingEngine } from '../features/handwriting/HandwritingEngine';
import { OCRHandler } from '../features/ai/OCRHandler';

import { PDFEditor } from '../features/pdf/PDFEditor';
import { RightSidebar } from './RightSidebar';

export const EditorWorkspace = ({ file, pdfDoc, setPdfDoc }) => {
    const [activeTool, setActiveTool] = useState('edit'); // edit, ai
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);

    // Right Sidebar Tools
    const [rightActiveTool, setRightActiveTool] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedText, setAnalyzedText] = useState(null);
    const [activePage, setActivePage] = useState(1);

    // Rendered File URL (for updates)
    const [renderedFileUrl, setRenderedFileUrl] = useState(null);

    const currentCanvasRef = useRef(null);
    const thumbnailContainerRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const [drawColor, setDrawColor] = useState('#ce0a3a'); // brand-red
    const [markerSize, setMarkerSize] = useState(15);
    const [eraserSize, setEraserSize] = useState(20);
    const [whiteoutSize, setWhiteoutSize] = useState(30);
    const [signatureSize, setSignatureSize] = useState(2);
    const [currentDrawingTool, setCurrentDrawingTool] = useState(null); // 'marker', 'eraser', 'signature', 'whiteout'

    const [signatureImage, setSignatureImage] = useState(null);
    const signatureInputRef = useRef(null);

    // History State
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const activeStrokeRef = useRef([]);
    const preStrokeCanvasStateRef = useRef(null);

    const navigatePage = (direction) => {
        const pageCount = pdfDoc?.getPageCount() || 0;
        if (direction === 'prev') {
            setActivePage(prev => Math.max(1, prev - 1));
        } else {
            setActivePage(prev => Math.min(pageCount, prev + 1));
        }
    };

    // Sync PDF changes to view
    useEffect(() => {
        const updateView = async () => {
            if (pdfDoc) {
                try {
                    // Clamp active page to valid range
                    const count = pdfDoc.getPageCount();
                    if (activePage > count) setActivePage(Math.max(1, count));

                    const blob = await PDFEditor.exportPDF(pdfDoc);
                    const url = URL.createObjectURL(blob);
                    setRenderedFileUrl(prev => {
                        if (prev) URL.revokeObjectURL(prev); // Cleanup old
                        return url;
                    });
                } catch (e) {
                    console.error("Failed to update PDF view", e);
                }
            }
        };
        updateView();

        return () => {
            // Cleanup handled in setter
        };
    }, [pdfDoc]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (renderedFileUrl) URL.revokeObjectURL(renderedFileUrl);
        };
    }, []);

    // Style State
    const [selectedFont, setSelectedFont] = useState(HANDWRITING_FONTS[0].id);
    const [selectedPaper, setSelectedPaper] = useState(PAPER_TYPES[0].id);
    const [chaosLevel, setChaosLevel] = useState(50); // 0-100

    // Preview Canvas
    const previewCanvasRef = useRef(null);

    useEffect(() => {
        if (activeTool === 'style' && previewCanvasRef.current) {
            const canvas = previewCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const engine = new HandwritingEngine(canvas);

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Render Preview
            const fontObj = HANDWRITING_FONTS.find(f => f.id === selectedFont);
            const fontSize = 24;

            engine.renderText("Human Preview 123", 20, 50, {
                font: `${fontSize}px ${fontObj.family.split(',')[0]}`,
                jitter: chaosLevel / 100, // Map 0-100 to 0-1
                rotation: chaosLevel / 20, // Map 0-100 to 0-5 degrees
                spacingVariance: chaosLevel / 30
            });
        }
    }, [activeTool, selectedFont, chaosLevel]);

    // --- Tool Handlers ---

    const handleRightToolClick = async (toolId) => {
        setRightActiveTool(toolId);

        switch (toolId) {
            case 'organize':
                // Toggle thumbnail view (or specific organize view)
                // For now, we'll use existing logic to switch views if we had a view state
                // But PDFViewer handles viewMode. We need to lift viewMode state up or trigger it.
                // Currently activePage is state. viewMode is prop to PDFViewer but hardcoded?
                // Wait, PDFViewer in EditorWorkspace is used twice: one 'single', one 'thumbnail'.
                // I should allow switching the main view to 'thumbnail' (grid).
                // But EditorWorkspace structure is fixed (Preview + Thumb strip).
                // I will add a state `viewMode` to EditorWorkspace to control the main area.
                setViewMode(prev => prev === 'single' ? 'list' : 'single'); // 'list' acts as grid in PDFViewer
                break;

            case 'image-to-pdf':
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = async (e) => {
                    if (e.target.files?.length) {
                        try {
                            const newDoc = await PDFEditor.imagesToPDF(Array.from(e.target.files));
                            if (pdfDoc) {
                                // Merge with existing
                                const merged = await PDFEditor.mergePDFs([pdfDoc, newDoc]);
                                setPdfDoc(merged);
                            } else {
                                setPdfDoc(newDoc);
                            }
                        } catch (err) {
                            console.error("Failed to convert images", err);
                            alert("Failed to convert images to PDF");
                        }
                    }
                };
                input.click();
                break;

            case 'pdf-to-image':
                if (!pdfDoc) return;
                exportPdfToImages();
                break;

            case 'split':
                if (!pdfDoc) return;
                const range = prompt("Enter page range to extract (e.g., 1-3, 5):");
                if (range) {
                    // Simple parsing
                    const pages = [];
                    const parts = range.split(',');
                    parts.forEach(part => {
                        if (part.includes('-')) {
                            const [start, end] = part.split('-').map(Number);
                            for (let i = start; i <= end; i++) pages.push(i - 1);
                        } else {
                            pages.push(Number(part) - 1);
                        }
                    });
                    // Filter valid
                    const validPages = pages.filter(p => p >= 0 && p < pdfDoc.getPageCount());
                    if (validPages.length) {
                        const newDoc = await PDFEditor.splitPDF(pdfDoc, validPages);
                        downloadPDF(newDoc, 'split_document.pdf');
                    }
                }
                break;

            case 'merge':
                const mergeInput = document.createElement('input');
                mergeInput.type = 'file';
                mergeInput.accept = 'application/pdf';
                mergeInput.multiple = true;
                mergeInput.onchange = async (e) => {
                    if (e.target.files?.length) {
                        const docs = [pdfDoc];
                        for (const f of e.target.files) {
                            const d = await PDFEditor.loadPDF(f);
                            docs.push(d);
                        }
                        const merged = await PDFEditor.mergePDFs(docs);
                        setPdfDoc(merged);
                    }
                };
                mergeInput.click();
                break;

            case 'eraser':
            case 'marker':
            case 'signature':
                setCurrentDrawingTool(toolId === currentDrawingTool ? null : toolId);
                break;

            case 'color':
                const colors = ['#ce0a3a', '#000000', '#0000ff', '#00ff00', '#ffff00'];
                const nextColor = colors[(colors.indexOf(drawColor) + 1) % colors.length];
                setDrawColor(nextColor);
                break;
        }
    };

    const downloadPDF = async (doc, name) => {
        const blob = await PDFEditor.exportPDF(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPdfToImages = async () => {
        if (!pdfDoc || !currentCanvasRef.current) return;

        try {
            const canvas = currentCanvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `page_${activePage}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error("Failed to export page as image", e);
            alert("Failed to export page as image. Make sure the page is fully rendered.");
        }
    };

    const handleAnalyzePage = async () => {
        if (!currentCanvasRef.current) return;
        setIsAnalyzing(true);
        try {
            const result = await OCRHandler.analyzeImage(currentCanvasRef.current);
            setAnalyzedText(result);
        } catch (e) {
            console.error("OCR Error", e);
            alert("Failed to analyze page text.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Background removal: make white/near-white pixels transparent
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    if (r > 200 && g > 200 && b > 200) {
                        data[i + 3] = 0;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                setSignatureImage(canvas.toDataURL());
                setCurrentDrawingTool('signature');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleClearPage = () => {
        if (!currentCanvasRef.current) return;
        const canvas = currentCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
    };

    // History Functions
    const saveToHistory = useCallback(() => {
        const canvas = currentCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(snapshot);

        if (newHistory.length > 20) newHistory.shift();

        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep]);

    const handleUndo = useCallback(() => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            const canvas = currentCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear first for transparency
            ctx.putImageData(history[newStep], 0, 0);
        } else if (historyStep === 0) {
            // Undo from first state (initial draw) back to totally clear
            setHistoryStep(-1);
            const canvas = currentCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [history, historyStep]);

    const handleRedo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            const canvas = currentCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(history[newStep], 0, 0);
        }
    }, [history, historyStep]);

    // Drawing Handlers
    const startDrawing = useCallback((e) => {
        if (!currentDrawingTool || !currentCanvasRef.current) return;

        // Initialize history with empty state if needed
        if (history.length === 0) {
            const canvas = currentCanvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([initialSnapshot]);
            setHistoryStep(0);
        }

        isDrawingRef.current = true;
        const canvas = currentCanvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Handle both mouse and touch
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        lastPosRef.current = {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };

        const ctx = canvas.getContext('2d');
        
        // For smooth marker: save state and start path
        if (currentDrawingTool === 'marker') {
            preStrokeCanvasStateRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            activeStrokeRef.current = [lastPosRef.current];
        }

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (currentDrawingTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = eraserSize;
            ctx.globalAlpha = 1.0;
        } else if (currentDrawingTool === 'marker') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = markerSize;
            ctx.globalAlpha = 0.5;
        } else if (currentDrawingTool === 'whiteout') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = whiteoutSize;
            ctx.globalAlpha = 1.0;
        } else if (currentDrawingTool === 'signature') {
            if (signatureImage) {
                const img = new Image();
                img.onload = () => {
                    const aspect = img.width / img.height;
                    const width = signatureSize * 50;
                    const height = width / aspect;
                    ctx.drawImage(img, lastPosRef.current.x - width / 2, lastPosRef.current.y - height / 2, width, height);
                    saveToHistory();
                };
                img.src = signatureImage;
                isDrawingRef.current = false;
                return;
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = signatureSize;
            ctx.globalAlpha = 1.0;
        }

        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.stroke();
    }, [currentDrawingTool, history, drawColor, markerSize, eraserSize, signatureSize]);

    const draw = useCallback((e) => {
        if (!isDrawingRef.current || !currentDrawingTool || !currentCanvasRef.current) return;
        const canvas = currentCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currentPos = {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };

        if (currentDrawingTool === 'marker' && preStrokeCanvasStateRef.current) {
            // Smooth marker logic: restore state and redraw entire path
            ctx.putImageData(preStrokeCanvasStateRef.current, 0, 0);
            activeStrokeRef.current.push(currentPos);
            
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = markerSize;
            ctx.globalAlpha = 0.5;
            
            ctx.moveTo(activeStrokeRef.current[0].x, activeStrokeRef.current[0].y);
            for (let i = 1; i < activeStrokeRef.current.length; i++) {
                ctx.lineTo(activeStrokeRef.current[i].x, activeStrokeRef.current[i].y);
            }
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (currentDrawingTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)'; // Ensure stroke exists for erasing
                ctx.lineWidth = eraserSize;
                ctx.globalAlpha = 1.0;
            } else if (currentDrawingTool === 'whiteout') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = 'white';
                ctx.lineWidth = whiteoutSize;
                ctx.globalAlpha = 1.0;
            } else if (currentDrawingTool === 'signature') {
                // Signature is handled in startDrawing (stamp)
                return;
            }

            ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
        }

        lastPosRef.current = currentPos;

        // Reset composite/alpha
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }, [currentDrawingTool, drawColor, markerSize, eraserSize, signatureSize]);

    const stopDrawing = useCallback(() => {
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            saveToHistory();
            activeStrokeRef.current = [];
            preStrokeCanvasStateRef.current = null;
        }
    }, [saveToHistory]);

    // Attach listeners
    useEffect(() => {
        const canvas = currentCanvasRef.current;
        if (canvas) {
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            window.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('touchstart', startDrawing, { passive: false });
            canvas.addEventListener('touchmove', draw, { passive: false });
            window.addEventListener('touchend', stopDrawing);

            return () => {
                canvas.removeEventListener('mousedown', startDrawing);
                canvas.removeEventListener('mousemove', draw);
                window.removeEventListener('mouseup', stopDrawing);
                canvas.removeEventListener('touchstart', startDrawing);
                canvas.removeEventListener('touchmove', draw);
                window.removeEventListener('touchend', stopDrawing);
            };
        }
    }, [startDrawing, draw, stopDrawing, activePage, renderedFileUrl]); // Re-attach on page change as canvas might be new

    // Main View State
    const [viewMode, setViewMode] = useState('single'); // 'single', 'list' (grid)

    const tools = [
        { id: 'edit', icon: Type, label: 'Edit' },
        { id: 'ai', icon: Sparkles, label: 'AI Magic' },
    ];

    const handlePageClick = useCallback((page) => {
        setActivePage(page);
        setHistory([]);
        setHistoryStep(-1);
    }, []);

    return (
        <div className="flex h-full w-full overflow-hidden bg-brand-dark text-brand-blue">
            {/* Left Sidebar - Tools */}
            <motion.div
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="h-full border-r border-brand-blue/10 bg-brand-dark flex flex-col relative transition-all duration-300 z-20"
            >
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-6 bg-brand-red rounded-full p-1 hover:bg-brand-pink transition-colors z-30 shadow-lg"
                >
                    {isSidebarOpen ? <ChevronLeft size={16} className="text-white" /> : <ChevronRight size={16} className="text-white" />}
                </button>

                <div className="p-4 flex flex-col gap-4 h-full">
                    <div className="flex flex-col gap-2">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    activeTool === tool.id
                                        ? "bg-gradient-to-r from-brand-red/20 to-brand-pink/20 text-white border border-brand-red/50"
                                        : "hover:bg-white/5 text-brand-blue/60 hover:text-white"
                                )}
                            >
                                <tool.icon size={24} className={cn("shrink-0 relative z-10", activeTool === tool.id && "text-brand-red")} />
                                {isSidebarOpen && (
                                    <span className="font-medium whitespace-nowrap overflow-hidden relative z-10">
                                        {tool.label}
                                    </span>
                                )}
                                {activeTool === tool.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-brand-pink/10"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="h-px bg-brand-blue/10 my-2" />

                    {/* Tool Options Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isSidebarOpen && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTool}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >

                                    {activeTool === 'edit' && (
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-bold text-brand-blue/40 uppercase tracking-widest pl-1">Document</h3>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
                                                <div className="text-xs text-brand-blue/50">Total Pages</div>
                                                <div className="text-3xl font-bold text-white font-['Outfit']">{pdfDoc?.getPageCount() || 0}</div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-xs font-bold text-brand-blue/40 uppercase tracking-widest pl-1">Drawing Tools</h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleUndo}
                                                            disabled={historyStep <= 0}
                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-brand-blue/60 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Undo"
                                                        >
                                                            <Undo2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={handleRedo}
                                                            disabled={historyStep >= history.length - 1}
                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-brand-blue/60 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Redo"
                                                        >
                                                            <Redo2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'marker', icon: Highlighter, label: 'Marker' },
                                                        { id: 'eraser', icon: Eraser, label: 'Eraser' },
                                                        { id: 'signature', icon: PenTool, label: 'Signature' },
                                                        { id: 'whiteout', icon: Square, label: 'Expunge' }
                                                    ].map((tool) => (
                                                        <button
                                                            key={tool.id}
                                                            onClick={() => {
                                                                if (tool.id === 'signature' && !signatureImage) {
                                                                    signatureInputRef.current?.click();
                                                                } else {
                                                                    setCurrentDrawingTool(currentDrawingTool === tool.id ? null : tool.id);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "flex flex-col items-center gap-2 p-3 rounded-xl transition-all border",
                                                                currentDrawingTool === tool.id
                                                                    ? "bg-brand-red/20 border-brand-red text-white"
                                                                    : "bg-white/5 border-transparent text-brand-blue/60 hover:bg-white/10"
                                                            )}
                                                        >
                                                            <tool.icon size={20} />
                                                            <span className="text-[10px] font-bold uppercase">{tool.label}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                <input
                                                    type="file"
                                                    ref={signatureInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleSignatureUpload}
                                                />

                                                <AnimatePresence mode="wait">
                                                    {currentDrawingTool && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-4 overflow-hidden pt-2"
                                                        >
                                                            {/* Size Slider */}
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] text-brand-blue/40 uppercase font-bold tracking-wider">Brush Size</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <div 
                                                                            className="rounded-full bg-brand-red/40 border border-brand-red/60"
                                                                            style={{ 
                                                                                width: `${Math.max(4, (currentDrawingTool === 'marker' ? markerSize : currentDrawingTool === 'eraser' ? eraserSize : currentDrawingTool === 'whiteout' ? whiteoutSize : signatureSize * 5) / 2)}px`,
                                                                                height: `${Math.max(4, (currentDrawingTool === 'marker' ? markerSize : currentDrawingTool === 'eraser' ? eraserSize : currentDrawingTool === 'whiteout' ? whiteoutSize : signatureSize * 5) / 2)}px`
                                                                            }}
                                                                        />
                                                                        <span className="text-xs font-mono font-bold text-brand-red min-w-[3ch] text-right">
                                                                            {currentDrawingTool === 'marker' ? markerSize :
                                                                                currentDrawingTool === 'eraser' ? eraserSize : 
                                                                                currentDrawingTool === 'whiteout' ? whiteoutSize : signatureSize}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] text-brand-blue/30 font-bold">MIN</span>
                                                                    <input
                                                                        type="range"
                                                                        min={currentDrawingTool === 'signature' ? "1" : currentDrawingTool === 'marker' ? "1" : "5"}
                                                                        max={currentDrawingTool === 'signature' ? "10" : currentDrawingTool === 'marker' ? "50" : "100"}
                                                                        value={currentDrawingTool === 'marker' ? markerSize :
                                                                            currentDrawingTool === 'eraser' ? eraserSize : 
                                                                            currentDrawingTool === 'whiteout' ? whiteoutSize : signatureSize}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value);
                                                                            if (currentDrawingTool === 'marker') setMarkerSize(val);
                                                                            else if (currentDrawingTool === 'eraser') setEraserSize(val);
                                                                            else if (currentDrawingTool === 'whiteout') setWhiteoutSize(val);
                                                                            else if (currentDrawingTool === 'signature') setSignatureSize(val);
                                                                        }}
                                                                        className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-red"
                                                                    />
                                                                    <span className="text-[10px] text-brand-blue/30 font-bold">MAX</span>
                                                                </div>
                                                            </div>

                                                            {/* Eraser Specific: Clear All */}
                                                            {currentDrawingTool === 'eraser' && (
                                                                <button
                                                                    onClick={handleClearPage}
                                                                    className="w-full py-2 px-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-brand-blue/60 hover:text-red-500 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Clear Entire Page
                                                                </button>
                                                            )}

                                                            {/* Signature Specific: Change Image */}
                                                            {currentDrawingTool === 'signature' && signatureImage && (
                                                                <button
                                                                    onClick={() => signatureInputRef.current?.click()}
                                                                    className="w-full py-2 px-3 bg-white/5 hover:bg-brand-red/10 border border-white/10 hover:border-brand-red/50 text-brand-blue/60 hover:text-brand-red rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <ImageIcon size={14} />
                                                                    Change Signature
                                                                </button>
                                                            )}

                                                            {/* Color Picker for Marker */}
                                                            {currentDrawingTool === 'marker' && (
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] text-brand-blue/40 uppercase font-bold tracking-wider">Color</div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {['#ce0a3a', '#000000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff'].map(color => (
                                                                            <button
                                                                                key={color}
                                                                                onClick={() => setDrawColor(color)}
                                                                                className={cn(
                                                                                    "w-6 h-6 rounded-full border-2 transition-all",
                                                                                    drawColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                                                                                )}
                                                                                style={{ backgroundColor: color }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    if (pdfDoc) {
                                                        const blob = await PDFEditor.exportPDF(pdfDoc);
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `edited_${file.name}`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }
                                                }}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-brand-red to-brand-pink hover:from-brand-pink hover:to-brand-red text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-red/30 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Download size={18} />
                                                Export PDF
                                            </button>
                                        </div>
                                    )}

                                    {activeTool === 'ai' && (
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-bold text-brand-blue/40 uppercase tracking-widest pl-1">AI Analysis</h3>

                                            <button
                                                onClick={handleAnalyzePage}
                                                disabled={isAnalyzing}
                                                className="w-full py-4 px-4 bg-gradient-to-r from-brand-red to-brand-pink hover:from-brand-pink hover:to-brand-red text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-red/30 active:scale-95 flex flex-col items-center justify-center gap-2 relative overflow-hidden group"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Analyzing Page...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={20} className="group-hover:animate-pulse" />
                                                        <span>Analyze Current Page</span>
                                                    </>
                                                )}
                                            </button>

                                            <AnimatePresence>
                                                {analyzedText && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                                            <div className="text-[10px] text-brand-blue/40 uppercase font-bold tracking-wider">Detected Text</div>
                                                            <div className="text-sm text-brand-blue/80 leading-relaxed font-['Inter'] line-clamp-6">
                                                                {analyzedText.fullText}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                                                <div className="text-[10px] text-brand-blue/40 uppercase font-bold">Words</div>
                                                                <div className="text-xl font-bold text-white">{analyzedText.words.length}</div>
                                                            </div>
                                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                                                <div className="text-[10px] text-brand-blue/40 uppercase font-bold">Confidence</div>
                                                                <div className="text-xl font-bold text-brand-red">
                                                                    {Math.round(analyzedText.words.reduce((acc, w) => acc + w.confidence, 0) / (analyzedText.words.length || 1))}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Main Area (Gallery Layout) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Center: Active Page Preview */}
                <div className="flex-1 bg-brand-dark/50 relative overflow-hidden flex flex-col items-center justify-center p-0 min-h-0 -mt-4">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ceeffe 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <PDFViewer
                            file={renderedFileUrl || file}
                            pdfDoc={pdfDoc}
                            setPdfDoc={setPdfDoc}
                            activePage={activePage}
                            pageCount={pdfDoc?.getPageCount()}
                            viewMode={viewMode === 'single' ? 'single' : 'list'} // Map 'list' to PDFViewer's list mode
                            onCanvasReady={(canvas) => currentCanvasRef.current = canvas}
                        />
                    </div>
                </div>

                {/* Bottom: Collapsible Thumbnail Drawer */}
                <div
                    className="absolute bottom-6 left-0 right-0 z-40 group/drawer px-10"
                    onMouseEnter={() => !currentDrawingTool && setIsBottomDrawerOpen(true)}
                    onMouseLeave={() => setIsBottomDrawerOpen(false)}
                >
                    {/* Hover Trigger Handle */}
                    <div className="h-4 w-full flex items-center justify-center cursor-ns-resize group-hover/drawer:opacity-0 transition-opacity">
                        <div className="w-16 h-1 bg-brand-blue/30 rounded-full" />
                    </div>

                    <motion.div
                        initial={{ y: "calc(100% - 16px)" }}
                        animate={{ y: isBottomDrawerOpen ? 0 : "calc(100% - 16px)" }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="h-40 border border-brand-blue/10 bg-brand-dark/95 backdrop-blur-2xl flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden max-w-5xl mx-auto"
                    >
                        <div className="px-4 py-2 border-b border-brand-blue/5 flex justify-between items-center shrink-0">
                            <span className="text-xs font-bold text-brand-blue/50 uppercase tracking-widest flex items-center gap-2">
                                <LayoutIcon size={12} /> Pages Gallery
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-brand-blue/40">Hover to reveal</span>
                            </div>
                        </div>

                        <div className="flex-1 relative flex items-center group/nav overflow-hidden">
                            {/* Navigation Buttons */}
                            <div className="absolute left-0 inset-y-0 flex items-center z-50 pl-2">
                                <button
                                    onClick={() => navigatePage('prev')}
                                    disabled={activePage === 1}
                                    className="p-2 bg-brand-dark/90 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-brand-red hover:border-brand-red transition-all shadow-xl backdrop-blur-md opacity-0 group-hover/nav:opacity-100 translate-x-[-10px] group-hover/nav:translate-x-0 disabled:hidden"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            </div>

                            <div
                                ref={thumbnailContainerRef}
                                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar px-8 py-4 flex items-center gap-4 scroll-smooth h-full"
                            >
                                <PDFViewer
                                    file={renderedFileUrl || file}
                                    pdfDoc={pdfDoc}
                                    setPdfDoc={setPdfDoc}
                                    activePage={activePage}
                                    pageCount={pdfDoc?.getPageCount()}
                                    viewMode="thumbnail"
                                    onPageClick={handlePageClick}
                                />
                            </div>

                            <div className="absolute right-0 inset-y-0 flex items-center z-50 pr-2">
                                <button
                                    onClick={() => navigatePage('next')}
                                    disabled={activePage === (pdfDoc?.getPageCount() || 0)}
                                    className="p-2 bg-brand-dark/90 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-brand-red hover:border-brand-red transition-all shadow-xl backdrop-blur-md opacity-0 group-hover/nav:opacity-100 translate-x-[10px] group-hover/nav:translate-x-0 disabled:hidden"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>


            <RightSidebar
                isOpen={isRightSidebarOpen}
                toggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                onToolClick={handleRightToolClick}
                activeTool={rightActiveTool}
            />
        </div >
    );
};
