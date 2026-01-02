import { PDFDocument, degrees } from 'pdf-lib';

export class PDFEditor {
  /**
   * Load PDF from file
   */
  static async loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc;
  }

  /**
   * Rotate a page by degrees (90, 180, 270)
   */
  static rotatePage(pdfDoc, pageIndex, rotation) {
    const page = pdfDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  }

  /**
   * Delete a page
   */
  static deletePage(pdfDoc, pageIndex) {
    pdfDoc.removePage(pageIndex);
  }

  /**
   * Reorder pages
   */
  static async reorderPages(pdfDoc, newOrder) {
    const newPdf = await PDFDocument.create();
    
    for (const index of newOrder) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
      newPdf.addPage(copiedPage);
    }
    
    return newPdf;
  }

  /**
   * Add blank page
   */
  static addBlankPage(pdfDoc, width = 595, height = 842) {
    // A4 size by default
    pdfDoc.addPage([width, height]);
  }

  /**
   * Merge multiple PDFs
   */
  static async mergePDFs(pdfDocs) {
    const mergedPdf = await PDFDocument.create();
    
    for (const pdfDoc of pdfDocs) {
      const pageCount = pdfDoc.getPageCount();
      const copiedPages = await mergedPdf.copyPages(pdfDoc, [...Array(pageCount).keys()]);
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    
    return mergedPdf;
  }

  /**
   * Convert Images to PDF
   */
  static async imagesToPDF(imageFiles) {
    const pdfDoc = await PDFDocument.create();
    
    for (const file of imageFiles) {
      const imageBytes = await file.arrayBuffer();
      let image;
      
      if (file.type === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        continue; // Skip unsupported
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
    
    return pdfDoc;
  }

  /**
   * Split PDF (extract pages to new PDF)
   */
  static async splitPDF(pdfDoc, pageIndices) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    return newPdf;
  }

  /**
   * Export PDF as blob
   */
  static async exportPDF(pdfDoc) {
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
}
