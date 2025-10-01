// services/embeddingService.ts
import { pipeline } from '@xenova/transformers';
import type { DocumentChunk } from '../types';

export class EmbeddingService {
  private extractor: any = null;
  private isInitialized = false;

  // Initialize the embedding model
  async initialize() {
    if (this.isInitialized) return;

    try {
      // ✅ Use the model name (Xenova auto-downloads it correctly)
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );

      this.isInitialized = true;
      console.log('Embedding service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize embedding service:', error);
      throw error;
    }
  }

  // Embed a single text
  async embedText(text: string): Promise<number[]> {
    if (!this.isInitialized) await this.initialize();

    try {
      const output = await this.extractor(text, {
        pooling: 'mean',
        normalize: true,
      });

      return Array.from(output.data);
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  // Embed multiple document chunks
  async embedChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    if (!this.isInitialized) await this.initialize();

    const embeddedChunks: DocumentChunk[] = [];

    for (const chunk of chunks) {
      try {
        const embedding = await this.embedText(chunk.content);
        embeddedChunks.push({
          ...chunk,
          embedding,
        });
      } catch (error) {
        console.error(`Failed to embed chunk ${chunk.id}:`, error);
        embeddedChunks.push(chunk);
      }
    }

    return embeddedChunks;
  }

  // Cosine similarity between two vectors
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search top-K similar chunks
  async searchSimilar(
    query: string,
    chunks: DocumentChunk[],
    topK: number = 5
  ): Promise<Array<{ chunk: DocumentChunk; score: number }>> {
    if (!this.isInitialized) await this.initialize();

    const queryEmbedding = await this.embedText(query);

    const results = chunks
      .filter((chunk) => chunk.embedding && chunk.embedding.length > 0)
      .map((chunk) => ({
        chunk,
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService();
