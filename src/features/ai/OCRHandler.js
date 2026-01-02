import Tesseract from 'tesseract.js';

export class OCRHandler {
  /**
   * Recognizes text from a canvas or image source
   * @param {CanvasImageSource} source 
   * @returns {Promise<Array>} Array of word objects with bbox
   */
  static async analyzeImage(source) {
    const worker = await Tesseract.createWorker('eng');
    
    // Recognizing text
    const { data: { words, text } } = await worker.recognize(source);
    
    await worker.terminate();

    return {
      fullText: text,
      words: words.map(w => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox // {x0, y0, x1, y1}
      }))
    };
  }

  /**
   * Estimates font style/slant from bbox (very basic heuristic)
   * Real implementation would require deep learning model
   */
  static estimateStyle(words) {
    // Placeholder logic
    return {
      slant: 0,
      weight: 'normal',
      suggestedFont: 'indie' // default
    };
  }
}
