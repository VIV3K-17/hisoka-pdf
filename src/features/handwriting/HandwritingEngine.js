/**
 * Handwriting Engine
 * Simulates human writing imperfections.
 */

export class HandwritingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Renders text with human-like properties
   * @param {string} text - The text to render
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {Object} options - Style options
   */
  renderText(text, x, y, options = {}) {
    const {
      font = '30px "Indie Flower"',
      color = 'black',
      jitter = 0.5,
      rotation = 2, // degrees
      spacingVariance = 2,
    } = options;

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    
    let cursorX = x;

    for (let char of text) {
      this.ctx.save();
      
      // Apply random rotation
      const angle = (Math.random() - 0.5) * rotation * (Math.PI / 180);
      
      // Apply random translate (jitter)
      const offsetX = (Math.random() - 0.5) * jitter;
      const offsetY = (Math.random() - 0.5) * jitter;

      this.ctx.translate(cursorX + offsetX, y + offsetY);
      this.ctx.rotate(angle);
      
      this.ctx.fillText(char, 0, 0);
      
      this.ctx.restore();

      // update cursor position with variable spacing
      const width = this.ctx.measureText(char).width;
      const spacing = (Math.random() - 0.5) * spacingVariance;
      cursorX += width + spacing;
    }

    return cursorX; // Return end position
  }

  /**
   * Draws a strike-through line
   */
  drawStrike(startX, startY, endX, endY, options = {}) {
     const {
        color = 'black',
        thickness = 2,
        wobble = 2
     } = options;

     this.ctx.beginPath();
     this.ctx.strokeStyle = color;
     this.ctx.lineWidth = thickness;
     
     const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
     const segments = distance / 5; // One point every 5 pixels
     
     this.ctx.moveTo(startX, startY);

     for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;
        
        // Add wobble
        const offsetX = (Math.random() - 0.5) * wobble;
        const offsetY = (Math.random() - 0.5) * wobble;

        this.ctx.lineTo(x + offsetX, y + offsetY);
     }
     
     this.ctx.stroke();
  }
}
