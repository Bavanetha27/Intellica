import type { SearchQuery, SearchResult, Citation, ChatMessage } from '../types';
import { embeddingService } from './embeddingService';
import { storageService } from './storageService';

export class RAGService {
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const allChunks = await storageService.getAllChunks();

    let filteredChunks = allChunks;

    if (query.modality) {
      const documents = await storageService.getDocumentsByType(query.modality);
      const documentIds = new Set(documents.map(d => d.id));
      filteredChunks = allChunks.filter(chunk => documentIds.has(chunk.documentId));
    }

    const results = await embeddingService.searchSimilar(
      query.text,
      filteredChunks,
      query.limit || 5
    );

    const searchResults: SearchResult[] = [];

    for (const result of results) {
      const document = await storageService.getDocument(result.chunk.documentId);
      if (document) {
        searchResults.push({
          chunk: result.chunk,
          document,
          score: result.score,
        });
      }
    }

    return searchResults;
  }

  async generateAnswer(
    query: string,
    context: SearchResult[]
  ): Promise<{ answer: string; citations: Citation[] }> {
    const citations: Citation[] = context.map((result, index) => ({
      documentId: result.document.id,
      documentName: result.document.name,
      chunkId: result.chunk.id,
      content: result.chunk.content,
      page: result.chunk.startPage,
      timestamp: result.chunk.timestamp,
      relevanceScore: result.score,
    }));

    const contextText = context
      .map((result, index) => `[${index + 1}] ${result.chunk.content}`)
      .join('\n\n');

    const answer = this.generateLocalAnswer(query, contextText, citations.length);

    return { answer, citations };
  }

  private generateLocalAnswer(query: string, context: string, citationCount: number): string {
    const citationNumbers = Array.from({ length: citationCount }, (_, i) => `[${i + 1}]`);

    return `Based on the available documents ${citationNumbers.slice(0, 3).join(', ')}, here's what I found regarding "${query}":\n\n` +
      `The relevant information has been retrieved from ${citationCount} source(s). ` +
      `Please review the citations below for detailed context and verification.\n\n` +
      `Note: This is a retrieval-based response. For more advanced natural language generation, ` +
      `integrate a local LLM like Llama.cpp or use a cloud-based API.`;
  }

  async processQuery(query: string): Promise<ChatMessage> {
    const searchResults = await this.search({ text: query, limit: 5 });

    const { answer, citations } = await this.generateAnswer(query, searchResults);

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
      citations,
    };

    await storageService.saveMessage(message);

    return message;
  }

  async getCrossModalResults(
    query: string,
    sourceModality?: string
  ): Promise<Map<string, SearchResult[]>> {
    const allChunks = await storageService.getAllChunks();
    const results = await embeddingService.searchSimilar(query, allChunks, 20);

    const groupedResults = new Map<string, SearchResult[]>();

    for (const result of results) {
      const document = await storageService.getDocument(result.chunk.documentId);
      if (document) {
        const searchResult: SearchResult = {
          chunk: result.chunk,
          document,
          score: result.score,
        };

        const type = document.type;
        if (!groupedResults.has(type)) {
          groupedResults.set(type, []);
        }
        groupedResults.get(type)!.push(searchResult);
      }
    }

    return groupedResults;
  }
}

export const ragService = new RAGService();
