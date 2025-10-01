import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Document, DocumentChunk, ChatMessage } from '../types';

interface RAGDatabase extends DBSchema {
  documents: {
    key: string;
    value: Document;
    indexes: { 'by-type': string; 'by-status': string };
  };
  chunks: {
    key: string;
    value: DocumentChunk;
    indexes: { 'by-document': string };
  };
  messages: {
    key: string;
    value: ChatMessage;
    indexes: { 'by-timestamp': Date };
  };
}

export class StorageService {
  private db: IDBPDatabase<RAGDatabase> | null = null;

  async initialize() {
    this.db = await openDB<RAGDatabase>('rag-database', 1, {
      upgrade(db) {
        const documentStore = db.createObjectStore('documents', {
          keyPath: 'id',
        });
        documentStore.createIndex('by-type', 'type');
        documentStore.createIndex('by-status', 'status');

        const chunkStore = db.createObjectStore('chunks', {
          keyPath: 'id',
        });
        chunkStore.createIndex('by-document', 'documentId');

        const messageStore = db.createObjectStore('messages', {
          keyPath: 'id',
        });
        messageStore.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  async saveDocument(document: Document): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('documents', document);
  }

  async saveChunks(chunks: DocumentChunk[]): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('chunks', 'readwrite');
    await Promise.all([
      ...chunks.map(chunk => tx.store.put(chunk)),
      tx.done,
    ]);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    if (!this.db) await this.initialize();
    return this.db!.get('documents', id);
  }

  async getAllDocuments(): Promise<Document[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAll('documents');
  }

  async getDocumentsByType(type: string): Promise<Document[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAllFromIndex('documents', 'by-type', type);
  }

  async getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAllFromIndex('chunks', 'by-document', documentId);
  }

  async getAllChunks(): Promise<DocumentChunk[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAll('chunks');
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('messages', message);
  }

  async getAllMessages(): Promise<ChatMessage[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAll('messages');
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction(['documents', 'chunks'], 'readwrite');

    const chunks = await tx.objectStore('chunks').index('by-document').getAll(id);

    await Promise.all([
      tx.objectStore('documents').delete(id),
      ...chunks.map(chunk => tx.objectStore('chunks').delete(chunk.id)),
      tx.done,
    ]);
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction(['documents', 'chunks', 'messages'], 'readwrite');
    await Promise.all([
      tx.objectStore('documents').clear(),
      tx.objectStore('chunks').clear(),
      tx.objectStore('messages').clear(),
      tx.done,
    ]);
  }
}

export const storageService = new StorageService();
