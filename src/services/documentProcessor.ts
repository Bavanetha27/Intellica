import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { Document, DocumentChunk, DocumentType } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class DocumentProcessor {
  async processFile(file: File): Promise<{ document: Document; chunks: DocumentChunk[] }> {
    const documentType = this.detectDocumentType(file);
    const documentId = crypto.randomUUID();

    const document: Document = {
      id: documentId,
      name: file.name,
      type: documentType,
      size: file.size,
      uploadedAt: new Date(),
      status: 'processing',
    };

    try {
      let chunks: DocumentChunk[] = [];

      switch (documentType) {
        case 'pdf':
          chunks = await this.processPDF(file, documentId);
          break;
        case 'docx':
          chunks = await this.processDOCX(file, documentId);
          break;
        case 'text':
          chunks = await this.processText(file, documentId);
          break;
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }

      document.status = 'completed';
      document.processedAt = new Date();

      return { document, chunks };
    } catch (error) {
      document.status = 'failed';
      document.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private detectDocumentType(file: File): DocumentType {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'docx';
      case 'txt':
      case 'md':
        return 'text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
      case 'webm':
        return 'audio';
      default:
        return 'text';
    }
  }

  private async processPDF(file: File, documentId: string): Promise<DocumentChunk[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const chunks: DocumentChunk[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      if (pageText.trim()) {
        const pageChunks = this.chunkText(pageText, 500);

        pageChunks.forEach((chunkText, index) => {
          chunks.push({
            id: crypto.randomUUID(),
            documentId,
            content: chunkText,
            chunkIndex: chunks.length,
            startPage: pageNum,
            endPage: pageNum,
            metadata: {
              pageNumber: pageNum,
              totalPages: pdf.numPages,
            },
          });
        });
      }
    }

    return chunks;
  }

  private async processDOCX(file: File, documentId: string): Promise<DocumentChunk[]> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    const textChunks = this.chunkText(text, 500);

    return textChunks.map((chunkText, index) => ({
      id: crypto.randomUUID(),
      documentId,
      content: chunkText,
      chunkIndex: index,
      metadata: {
        source: 'docx',
      },
    }));
  }

  private async processText(file: File, documentId: string): Promise<DocumentChunk[]> {
    const text = await file.text();
    const textChunks = this.chunkText(text, 500);

    return textChunks.map((chunkText, index) => ({
      id: crypto.randomUUID(),
      documentId,
      content: chunkText,
      chunkIndex: index,
      metadata: {
        source: 'text',
      },
    }));
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

export const documentProcessor = new DocumentProcessor();
