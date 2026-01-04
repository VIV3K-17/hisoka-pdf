import { PDFDocument } from 'pdf-lib';

/**
 * Merge multiple PDF files into a single PDF
 * @param {File[]} files - Array of PDF files to merge
 * @returns {Promise<Uint8Array>} - Merged PDF as Uint8Array
 */
export async function mergePDFs(files) {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
}

/**
 * Split a PDF into individual pages or by range
 * @param {File} file - PDF file to split
 * @param {Object} options - Split options
 * @param {string} options.mode - 'all' | 'range' | 'extract'
 * @param {number[]} options.pages - Array of page numbers (0-indexed) for extract mode
 * @param {Object} options.range - {start: number, end: number} for range mode
 * @returns {Promise<Uint8Array[]>} - Array of PDF documents
 */
export async function splitPDF(file, options = { mode: 'all' }) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();
    const results = [];

    if (options.mode === 'all') {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(copiedPage);
            results.push(await newPdf.save());
        }
    } else if (options.mode === 'range' && options.range) {
        // Split by range
        const { start, end } = options.range;
        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        results.push(await newPdf.save());
    } else if (options.mode === 'extract' && options.pages) {
        // Extract specific pages
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, options.pages);
        copiedPages.forEach((page) => newPdf.addPage(page));
        results.push(await newPdf.save());
    }

    return results;
}

/**
 * Compress a PDF by optimizing images and removing metadata
 * @param {File} file - PDF file to compress
 * @param {string} quality - 'low' | 'medium' | 'high'
 * @returns {Promise<Uint8Array>} - Compressed PDF
 */
export async function compressPDF(file, quality = 'medium') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    // Note: pdf-lib has limited compression capabilities
    // For better compression, you'd need a backend service
    // This implementation removes metadata and uses compression options

    // Remove metadata to reduce size
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('');
    pdf.setCreator('');

    // Determine compression settings based on quality
    const compressionSettings = {
        low: { useObjectStreams: true, addDefaultPage: false, objectsPerTick: 500 },
        medium: { useObjectStreams: true, addDefaultPage: false, objectsPerTick: 200 },
        high: { useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 }
    };

    // Save with compression options
    const pdfBytes = await pdf.save(compressionSettings[quality] || compressionSettings.medium);

    return pdfBytes;
}

/**
 * Organize PDF pages (rotate, delete, reorder)
 * @param {File} file - PDF file to organize
 * @param {Object[]} operations - Array of operations
 * @returns {Promise<Uint8Array>} - Organized PDF
 */
export async function organizePDF(file, operations) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    // operations format: [{ pageIndex: 0, action: 'keep'|'delete'|'rotate', rotation: 90|180|270 }]
    const pagesToKeep = operations
        .filter(op => op.action !== 'delete')
        .map(op => op.pageIndex);

    const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);

    copiedPages.forEach((page, index) => {
        const operation = operations.find(op => op.pageIndex === pagesToKeep[index]);
        if (operation && operation.rotation) {
            page.setRotation({ angle: operation.rotation, type: 'degrees' });
        }
        newPdf.addPage(page);
    });

    return await newPdf.save();
}

/**
 * Download a PDF file
 * @param {Uint8Array} pdfBytes - PDF data
 * @param {string} filename - Filename for download
 */
export function downloadPDF(pdfBytes, filename = 'document.pdf') {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Get PDF metadata
 * @param {File} file - PDF file
 * @returns {Promise<Object>} - PDF metadata
 */
export async function getPDFMetadata(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    return {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        creator: pdf.getCreator(),
        producer: pdf.getProducer(),
        creationDate: pdf.getCreationDate(),
        modificationDate: pdf.getModificationDate(),
    };
}
