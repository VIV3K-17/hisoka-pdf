import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DragDropUpload } from './components/DragDropUpload';
import { EditorWorkspace } from './components/EditorWorkspace';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFEditor } from './features/pdf/PDFEditor';
import { ToolsPage } from './pages/ToolsPage';
import { MergePDF } from './pages/features/MergePDF';
import { SplitPDF } from './pages/features/SplitPDF';
import { CompressPDF } from './pages/features/CompressPDF';
import { OrganizePDF } from './pages/features/OrganizePDF';
import { PDFToWord } from './pages/features/PDFToWord';
import { PDFToPowerPoint } from './pages/features/PDFToPowerPoint';
import { PDFToExcel } from './pages/features/PDFToExcel';
import { WordToPDF } from './pages/features/WordToPDF';
import { PowerPointToPDF } from './pages/features/PowerPointToPDF';
import { ExcelToPDF } from './pages/features/ExcelToPDF';
import { HandwritingGenerator } from './pages/features/HandwritingGenerator';

function HomePage() {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    const doc = await PDFEditor.loadPDF(selectedFile);
    setPdfDoc(doc);
  };

  return (
    <AnimatePresence mode='wait'>
      {!file ? (
        <motion.div
          key="upload"
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          className="w-full h-full flex flex-col items-center justify-center gap-12"
        >
          <div className="text-center space-y-6 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-2"
            >
              Reimagine <br />
              <span className="text-brand-red">Documents</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-brand-blue/60 font-light"
            >
              Transform static PDFs into dynamic, human-like handwritten documents with AI.
            </motion.p>
          </div>

          <DragDropUpload onFileSelect={handleFileSelect} />
        </motion.div>
      ) : (
        <motion.div
          key="editor"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full"
        >
          <EditorWorkspace file={file} pdfDoc={pdfDoc} setPdfDoc={setPdfDoc} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/merge-pdf" element={<MergePDF />} />
          <Route path="/tools/split-pdf" element={<SplitPDF />} />
          <Route path="/tools/compress-pdf" element={<CompressPDF />} />
          <Route path="/tools/organize-pdf" element={<OrganizePDF />} />
          <Route path="/tools/pdf-to-word" element={<PDFToWord />} />
          <Route path="/tools/pdf-to-powerpoint" element={<PDFToPowerPoint />} />
          <Route path="/tools/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/tools/word-to-pdf" element={<WordToPDF />} />
          <Route path="/tools/powerpoint-to-pdf" element={<PowerPointToPDF />} />
          <Route path="/tools/excel-to-pdf" element={<ExcelToPDF />} />
          <Route path="/tools/handwriting" element={<HandwritingGenerator />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

