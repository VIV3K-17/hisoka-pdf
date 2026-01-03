import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { RotateCw, Trash2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFEditor } from './PDFEditor';
import { ConfirmationModal } from '../../components/ConfirmationModal';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFViewer = React.memo(({
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
    const thumbnailRefs = useRef({});
    const [renderedThumbnails, setRenderedThumbnails] = useState(new Set()); // Track which thumbnails have rendered

    // Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, pageIndex: null });

    // Use external pageCount if available, otherwise internal state
    const numPages = pageCount || numPagesState;

    // Scroll active thumbnail into view
    useEffect(() => {
        if (viewMode === 'thumbnail' && activePage && thumbnailRefs.current[activePage]) {
            thumbnailRefs.current[activePage].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activePage, viewMode]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const overlayCanvasRef = useRef(null);

    function onPageRenderSuccess(page) {
        if (viewMode === 'single') {
            const container = document.querySelector('.react-pdf__Page');
            const pdfCanvas = container?.querySelector('canvas');
            const overlayCanvas = overlayCanvasRef.current;

            if (pdfCanvas && overlayCanvas) {
                // Synchronize overlay canvas with PDF canvas display size
                const rect = pdfCanvas.getBoundingClientRect();
                overlayCanvas.width = pdfCanvas.width;
                overlayCanvas.height = pdfCanvas.height;
                overlayCanvas.style.width = `${rect.width}px`;
                overlayCanvas.style.height = `${rect.height}px`;

                if (onCanvasReady) onCanvasReady(overlayCanvas);
            }
        }
    }

    const handleRotate = useCallback((pageIndex) => {
        if (pdfDoc) {
            PDFEditor.rotatePage(pdfDoc, pageIndex, 90);
            setPageRotations(prev => ({
                ...prev,
                [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360
            }));
            // Clear overlay on rotation
            if (overlayCanvasRef.current) {
                overlayCanvasRef.current.getContext('2d').clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
            }
        }
    }, [pdfDoc]);

    const handleDeleteClick = useCallback((pageIndex) => {
        if (pdfDoc && numPages > 1) {
            setDeleteModal({ isOpen: true, pageIndex });
        }
    }, [pdfDoc, numPages]);

    const confirmDelete = async () => {
        const { pageIndex } = deleteModal;
        if (pageIndex !== null && pdfDoc) {
            PDFEditor.deletePage(pdfDoc, pageIndex);
            // Force reload by creating new PDF from current state
            const blob = await PDFEditor.exportPDF(pdfDoc);
            const newDoc = await PDFEditor.loadPDF(new File([blob], file.name));
            setPdfDoc(newDoc);
            setNumPages(newDoc.getPageCount());
            // Clear overlay
            if (overlayCanvasRef.current) {
                overlayCanvasRef.current.getContext('2d').clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
            }
        }
        setDeleteModal({ isOpen: false, pageIndex: null });
    };

    // ... (Thumbnail logic remains same)

    // Memoized Thumbnail Item - only re-renders if pageNumber or rotation changes
    const ThumbnailItem = React.memo(
        ({ pageNumber, rotation, onClick, setRef }) => (
            <div
                ref={setRef}
                data-page-number={pageNumber}
                className="thumbnail-item relative cursor-pointer transition-all duration-200 flex-shrink-0 opacity-60 hover:opacity-100 hover:scale-105"
                onClick={onClick}
                style={{ height: '100px' }}
            >
                {/* Neon Glow Effect - controlled by CSS */}
                <div className="highlight-overlay absolute inset-0 rounded-md ring-2 ring-brand-red shadow-[0_0_20px_rgba(206,10,58,0.6),0_0_40px_rgba(206,10,58,0.4),inset_0_0_20px_rgba(206,10,58,0.1)] pointer-events-none z-20 opacity-0 transition-opacity" />

                <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    height={100}
                    rotate={rotation || 0}
                    className="rounded-md overflow-hidden bg-white w-full h-full object-contain shadow-md"
                    onRenderSuccess={() => {
                        setRenderedThumbnails(prev => new Set(prev).add(pageNumber));
                    }}
                    loading={
                        <div className="w-[70px] h-[100px] bg-white/5 animate-pulse rounded-md" />
                    }
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                    {pageNumber}
                </div>
            </div>
        ),
        (prevProps, nextProps) => {
            // Only re-render if pageNumber or rotation changes
            return (
                prevProps.pageNumber === nextProps.pageNumber &&
                prevProps.rotation === nextProps.rotation
            );
        }
    );

    // Memoize thumbnail array - ONLY re-create when numPages or pageRotations change
    // This ensures the thumbnails themselves NEVER re-render when activePage changes
    const thumbnailItems = useMemo(() => {
        if (viewMode === 'thumbnail' && numPages) {
            return Array.from(new Array(numPages), (el, index) => (
                <ThumbnailItem
                    key={`thumb_${index + 1}`}
                    pageNumber={index + 1}
                    rotation={pageRotations[index]}
                    onClick={() => onPageClick && onPageClick(index + 1)}
                    setRef={el => thumbnailRefs.current[index + 1] = el}
                />
            ));
        }
        return null;
    }, [numPages, pageRotations, viewMode, onPageClick]);

    // Memoize the entire thumbnail document to prevent any re-renders when activePage changes
    const thumbnailDocument = useMemo(() => {
        if (viewMode !== 'thumbnail') return null;
        return (
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex gap-4 px-4 thumbnails-container min-w-max"
                loading={
                    <div className="flex items-center gap-3 text-brand-blue/50">
                        <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                        Loading PDF...
                    </div>
                }
            >
                {thumbnailItems}
            </Document>
        );
    }, [file, viewMode, thumbnailItems]);

    return (
        <>
            <style>{`
                .thumbnails-wrapper[data-active-page="${activePage}"] .thumbnail-item[data-page-number="${activePage}"] {
                    opacity: 1;
                    transform: scale(1.05);
                    z-index: 10;
                    filter: drop-shadow(0 0 10px rgba(206, 10, 58, 0.8));
                }
                .thumbnails-wrapper[data-active-page="${activePage}"] .thumbnail-item[data-page-number="${activePage}"] .highlight-overlay {
                    opacity: 1;
                }
                /* Hide vertical scrollbar but keep horizontal */
                .custom-scrollbar::-webkit-scrollbar:vertical {
                    width: 0;
                    display: none;
                }
                .custom-scrollbar {
                    overflow-y: hidden !important;
                }
            `}</style>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Page"
                message={`Are you sure you want to delete page ${deleteModal.pageIndex + 1}? This action cannot be undone.`}
            />
            <div
                className={`${viewMode === 'thumbnail' ? 'h-fit w-fit min-w-full overflow-y-hidden' : 'h-full w-full'} thumbnails-wrapper ${viewMode === 'list' ? 'overflow-auto flex justify-center custom-scrollbar' : viewMode === 'single' ? 'overflow-auto flex items-start justify-center custom-scrollbar py-8' : 'flex items-center justify-start'}`}
                data-active-page={activePage}
            >
                {viewMode === 'thumbnail' ? (
                    thumbnailDocument
                ) : (
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="flex flex-col gap-4"
                        loading={
                            <div className="flex items-center gap-3 text-brand-blue/50">
                                <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                                Loading PDF...
                            </div>
                        }
                    >
                        {viewMode === 'single' && numPages && (
                            <div className="relative group my-auto h-full flex items-center justify-center transition-all p-0 shadow-2xl shadow-black/50">
                                {/* Page Controls Overlay */}
                                <div className="absolute -right-12 top-0 flex flex-col gap-2 z-20">
                                    <button
                                        onClick={() => handleRotate(activePage - 1)}
                                        className="p-2 bg-brand-dark/80 hover:bg-brand-red border border-brand-blue/10 text-brand-blue rounded-lg transition-colors"
                                        title="Rotate 90°"
                                    >
                                        <RotateCw size={18} />
                                    </button>
                                    {numPages > 1 && (
                                        <button
                                            onClick={() => handleDeleteClick(activePage - 1)}
                                            className="p-2 bg-brand-dark/80 hover:bg-brand-red border border-brand-blue/10 text-brand-blue rounded-lg transition-colors"
                                            title="Delete Page"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white/5 rounded-lg relative overflow-hidden">
                                    <Page
                                        key={`page_${activePage}`} // Force re-mount for clean transition
                                        pageNumber={activePage}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        scale={0.75} // Adjusted for optimal balance
                                        rotate={pageRotations[activePage - 1] || 0}
                                        onRenderSuccess={onPageRenderSuccess}
                                        className="max-w-full border border-brand-blue/10"
                                        loading={
                                            <div className="w-[600px] h-[800px] flex items-center justify-center">
                                                <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        }
                                    />
                                    {/* Web-only Drawing Overlay Canvas */}
                                    <canvas
                                        ref={overlayCanvasRef}
                                        className="absolute top-0 left-0 pointer-events-auto cursor-crosshair z-10"
                                        style={{ mixBlendMode: 'normal' }}
                                    />
                                </div>
                            </div>
                        )}

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
                )}
            </div>
        </>
    );
}, (prevProps, nextProps) => {
    // Re-render if file, viewMode, pdfDoc, or activePage changes
    return (
        prevProps.file === nextProps.file &&
        prevProps.viewMode === nextProps.viewMode &&
        prevProps.pdfDoc === nextProps.pdfDoc &&
        prevProps.activePage === nextProps.activePage
    );
});
