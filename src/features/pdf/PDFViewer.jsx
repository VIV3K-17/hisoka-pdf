import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { RotateCw, Trash2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFEditor } from './PDFEditor';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFViewer = ({
    file,
    onCanvasReady,
    pdfDoc,
    setPdfDoc,
    activePage = 1,
    viewMode = 'single', // 'single' | 'list' | 'thumbnail'
    onPageClick,
    pageCount // Optional external override
}) => {
    const [numPagesState, setNumPages] = useState(null);
    const [pageRotations, setPageRotations] = useState({});

    // Use external pageCount if available, otherwise internal state
    const numPages = pageCount || numPagesState;

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    function onPageRenderSuccess(page) {
        if (onCanvasReady && viewMode === 'single') {
            const canvas = document.querySelector(`.react-pdf__Page__canvas`);
            if (canvas) onCanvasReady(canvas);
        }
    }

    const handleRotate = (pageIndex) => {
        if (pdfDoc) {
            PDFEditor.rotatePage(pdfDoc, pageIndex, 90);
            setPageRotations(prev => ({
                ...prev,
                [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360
            }));
        }
    };

    const handleDelete = async (pageIndex) => {
        if (pdfDoc && numPages > 1) {
            PDFEditor.deletePage(pdfDoc, pageIndex);
            // Force reload by creating new PDF from current state
            const blob = await PDFEditor.exportPDF(pdfDoc);
            const newDoc = await PDFEditor.loadPDF(new File([blob], file.name));
            setPdfDoc(newDoc);
            setNumPages(newDoc.getPageCount());
        }
    };

    return (
        <div className={`h-full w-full ${viewMode === 'list' ? 'overflow-auto flex justify-center custom-scrollbar' : 'flex items-center justify-center'}`}>
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className={viewMode === 'thumbnail' ? "flex gap-4 px-4" : "flex flex-col gap-4"}
                loading={
                    <div className="flex items-center gap-3 text-[#ceeffe]/50">
                        <div className="w-5 h-5 border-2 border-[#ce0a3a] border-t-transparent rounded-full animate-spin" />
                        Loading...
                    </div>
                }
            >
                {viewMode === 'single' && numPages && (
                    <div className="relative group shadow-2xl shadow-black/50">
                        {/* Page Controls Overlay */}
                        <div className="absolute -right-12 top-0 flex flex-col gap-2">
                            <button
                                onClick={() => handleRotate(activePage - 1)}
                                className="p-2 bg-[#140f22]/80 hover:bg-[#ce0a3a] border border-[#ceeffe]/10 text-[#ceeffe] rounded-lg transition-colors"
                                title="Rotate 90°"
                            >
                                <RotateCw size={18} />
                            </button>
                            {numPages > 1 && (
                                <button
                                    onClick={() => handleDelete(activePage - 1)}
                                    className="p-2 bg-[#140f22]/80 hover:bg-[#ce0a3a] border border-[#ceeffe]/10 text-[#ceeffe] rounded-lg transition-colors"
                                    title="Delete Page"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <Page
                            pageNumber={activePage}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={1.2} // Larger for single view
                            rotate={pageRotations[activePage - 1] || 0}
                            onRenderSuccess={onPageRenderSuccess}
                            className="max-w-full border border-[#ceeffe]/10"
                        />
                    </div>
                )}

                {viewMode === 'thumbnail' && numPages && Array.from(new Array(numPages), (el, index) => (
                    <div
                        key={`thumb_${index + 1}`}
                        className={`relative cursor-pointer transition-all duration-200 ${activePage === index + 1 ? 'ring-2 ring-[#fcfaa0] scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                        onClick={() => onPageClick && onPageClick(index + 1)}
                    >
                        <Page
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={0.2}
                            width={150}
                            rotate={pageRotations[index] || 0}
                            className="rounded-md overflow-hidden bg-white"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                            {index + 1}
                        </div>
                    </div>
                ))}

                {viewMode === 'list' && Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="shadow-2xl relative group">
                        <Page
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={1}
                            rotate={pageRotations[index] || 0}
                            onRenderSuccess={index + 1 === activePage ? onPageRenderSuccess : undefined}
                            className="max-w-full"
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
};
