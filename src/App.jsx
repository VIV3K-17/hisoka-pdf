import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DragDropUpload } from './components/DragDropUpload';
import { EditorWorkspace } from './components/EditorWorkspace';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFEditor } from './features/pdf/PDFEditor';

function App() {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    // Load PDF document
    const doc = await PDFEditor.loadPDF(selectedFile);
    setPdfDoc(doc);
  };

  return (
    <Layout>
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
    </Layout>
  );
}

export default App;
