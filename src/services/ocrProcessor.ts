import Tesseract from 'tesseract.js';
import type { Document, DocumentChunk } from '../types';

export class OCRProcessor {
  async processImage(file: File, documentId: string): Promise<DocumentChunk[]> {
    const imageUrl = URL.createObjectURL(file);

    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      URL.revokeObjectURL(imageUrl);

      const text = result.data.text;

      if (!text.trim()) {
        return [];
      }

      const chunks = this.chunkText(text, 500);

      return chunks.map((chunkText, index) => ({
        id: crypto.randomUUID(),
        documentId,
        content: chunkText,
        chunkIndex: index,
        metadata: {
          source: 'ocr',
          confidence: result.data.confidence,
          imageName: file.name,
        },
      }));
    } catch (error) {
      console.error('OCR processing failed:', error);
      URL.revokeObjectURL(imageUrl);
      throw error;
    }
  }

  private chunkText(text: string, maxTokens: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    for (const word of words) {
      currentChunk.push(word);

      if (currentChunk.length >= maxTokens) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }
}

export const ocrProcessor = new OCRProcessor();
