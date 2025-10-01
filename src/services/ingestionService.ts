import type { Document, DocumentChunk, DocumentType } from '../types';
import { documentProcessor } from './documentProcessor';
import { ocrProcessor } from './ocrProcessor';
import { audioProcessor } from './audioProcessor';
import { embeddingService } from './embeddingService';
import { storageService } from './storageService';

export class IngestionService {
  async ingestFile(
    file: File,
    onProgress?: (status: string, progress: number) => void
  ): Promise<{ document: Document; chunks: DocumentChunk[] }> {
    const documentType = this.detectDocumentType(file);

    onProgress?.(`Processing ${documentType} file...`, 10);

    let document: Document;
    let chunks: DocumentChunk[] = [];

    try {
      switch (documentType) {
        case 'pdf':
        case 'docx':
        case 'text':
          const result = await documentProcessor.processFile(file);
          document = result.document;
          chunks = result.chunks;
          break;

        case 'image':
          document = {
            id: crypto.randomUUID(),
            name: file.name,
            type: 'image',
            size: file.size,
            uploadedAt: new Date(),
            status: 'processing',
          };
          chunks = await ocrProcessor.processImage(file, document.id);
          document.status = 'completed';
          document.processedAt = new Date();
          break;

        case 'audio':
          document = {
            id: crypto.randomUUID(),
            name: file.name,
            type: 'audio',
            size: file.size,
            uploadedAt: new Date(),
            status: 'processing',
          };
          chunks = await audioProcessor.processAudio(file, document.id);
          document.status = 'completed';
          document.processedAt = new Date();
          break;

        default:
          throw new Error(`Unsupported file type: ${documentType}`);
      }

      onProgress?.('Generating embeddings...', 50);

      const embeddedChunks = await embeddingService.embedChunks(chunks);

      onProgress?.('Saving to storage...', 90);

      await storageService.saveDocument(document);
      await storageService.saveChunks(embeddedChunks);

      onProgress?.('Complete!', 100);

      return { document, chunks: embeddedChunks };
    } catch (error) {
      console.error('Ingestion failed:', error);
      throw error;
    }
  }

  async ingestMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, fileName: string, status: string, progress: number) => void
  ): Promise<Array<{ document: Document; chunks: DocumentChunk[] }>> {
    const results: Array<{ document: Document; chunks: DocumentChunk[] }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.ingestFile(file, (status, progress) => {
          onProgress?.(i, file.name, status, progress);
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to ingest ${file.name}:`, error);
      }
    }

    return results;
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
}

export const ingestionService = new IngestionService();
