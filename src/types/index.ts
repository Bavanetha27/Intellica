export type DocumentType = 'pdf' | 'docx' | 'image' | 'audio' | 'text';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  status: ProcessingStatus;
  error?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  startPage?: number;
  endPage?: number;
  timestamp?: number;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  document: Document;
  score: number;
  highlights?: string[];
}

export interface Citation {
  documentId: string;
  documentName: string;
  chunkId: string;
  content: string;
  page?: number;
  timestamp?: number;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface SearchQuery {
  text: string;
  modality?: DocumentType;
  limit?: number;
}
