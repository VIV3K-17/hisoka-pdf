import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { RotateCw, Trash2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFEditor } from './PDFEditor';
import { ConfirmationModal } from '../../components/ConfirmationModal';

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
    const thumbnailRefs = useRef({});

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

    const handleDeleteClick = (pageIndex) => {
        if (pdfDoc && numPages > 1) {
            setDeleteModal({ isOpen: true, pageIndex });
        }
    };

    const confirmDelete = async () => {
        const { pageIndex } = deleteModal;
        if (pageIndex !== null && pdfDoc) {
            PDFEditor.deletePage(pdfDoc, pageIndex);
            // Force reload by creating new PDF from current state
            const blob = await PDFEditor.exportPDF(pdfDoc);
            const newDoc = await PDFEditor.loadPDF(new File([blob], file.name));
            setPdfDoc(newDoc);
            setNumPages(newDoc.getPageCount());
        }
        setDeleteModal({ isOpen: false, pageIndex: null });
    };

    // Memoized Thumbnail Item
    const ThumbnailItem = React.memo(({ pageNumber, isActive, rotation, onClick, setRef }) => (
        <div
            ref={setRef}
            className={`relative cursor-pointer transition-all duration-200 flex-shrink-0 ${isActive ? 'ring-2 ring-brand-yellow scale-105 z-10' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
            onClick={onClick}
            style={{ height: '140px' }}
        >
            <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                height={140}
                rotate={rotation || 0}
                className="rounded-md overflow-hidden bg-white w-full h-full object-contain shadow-md"
                loading={
                    <div className="w-[140px] h-[200px] bg-white/5 animate-pulse rounded-md" />
                }
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                {pageNumber}
            </div>
        </div>
    ));

    return (
        <>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Page"
                message={`Are you sure you want to delete page ${deleteModal.pageIndex + 1}? This action cannot be undone.`}
            />
            <div className={`h-full w-full ${viewMode === 'list' ? 'overflow-auto flex justify-center custom-scrollbar' : viewMode === 'single' ? 'overflow-auto flex items-start justify-center custom-scrollbar py-8' : 'flex items-center justify-center'}`}>
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className={viewMode === 'thumbnail' ? "flex gap-4 px-4" : "flex flex-col gap-4"}
                    loading={
                        <div className="flex items-center gap-3 text-brand-blue/50">
                            <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                            Loading PDF...
                        </div>
                    }
                >
                    {viewMode === 'single' && numPages && (
                        <div className="relative group shadow-2xl shadow-black/50 my-auto h-full flex items-center justify-center bg-white/5 rounded-lg transition-all p-4">
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

                            <Page
                                key={`page_${activePage}`} // Force re-mount for clean transition
                                pageNumber={activePage}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                scale={0.6} // Even smaller for single view
                                rotate={pageRotations[activePage - 1] || 0}
                                onRenderSuccess={onPageRenderSuccess}
                                className="max-w-full border border-brand-blue/10"
                                loading={
                                    <div className="w-[600px] h-[800px] flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
                                    </div>
                                }
                            />
                        </div>
                    )}

                    {viewMode === 'thumbnail' && numPages && Array.from(new Array(numPages), (el, index) => (
                        <ThumbnailItem
                            key={`thumb_${index + 1}`}
                            pageNumber={index + 1}
                            isActive={activePage === index + 1}
                            rotation={pageRotations[index]}
                            onClick={() => onPageClick && onPageClick(index + 1)}
                            setRef={el => thumbnailRefs.current[index + 1] = el}
                        />
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
        </>
    );
};
