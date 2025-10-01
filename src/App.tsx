import { useState, useEffect } from 'react';
import { Search, Upload as UploadIcon, Library, Database, Loader2 } from 'lucide-react';
import type { Document, ChatMessage } from './types';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { DocumentLibrary } from './components/DocumentLibrary';
import { Button } from './components/Button';
import { ingestionService } from './services/ingestionService';
import { ragService } from './services/ragService';
import { storageService } from './services/storageService';
import { embeddingService } from './services/embeddingService';

type View = 'chat' | 'upload' | 'library';

function App() {
  const [view, setView] = useState<View>('chat');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await storageService.initialize();
        await embeddingService.initialize();

        const storedDocuments = await storageService.getAllDocuments();
        setDocuments(storedDocuments);

        const storedMessages = await storageService.getAllMessages();
        setMessages(storedMessages);

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    initialize();
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);

    try {
      const results = await ingestionService.ingestMultipleFiles(
        files,
        (fileIndex, fileName, status, progress) => {
          console.log(`${fileName}: ${status} (${progress}%)`);
        }
      );

      const newDocuments = results.map((r) => r.document);
      setDocuments((prev) => [...prev, ...newDocuments]);

      setView('library');
    } catch (error) {
      console.error('File processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await ragService.processQuery(messageText);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Query processing failed:', error);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await storageService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-lg text-gray-600">Initializing RAG System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Multimodal RAG System</h1>
                <p className="text-sm text-gray-600">Offline semantic search across all formats</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={view === 'chat' ? 'primary' : 'outline'}
                onClick={() => setView('chat')}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Chat
              </Button>
              <Button
                variant={view === 'upload' ? 'primary' : 'outline'}
                onClick={() => setView('upload')}
                className="flex items-center gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                Upload
              </Button>
              <Button
                variant={view === 'library' ? 'primary' : 'outline'}
                onClick={() => setView('library')}
                className="flex items-center gap-2"
              >
                <Library className="w-4 h-4" />
                Library ({documents.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'chat' && (
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-12rem)]">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
            />
          </div>
        )}

        {view === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <FileUpload onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />

            {documents.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h2>
                <DocumentLibrary documents={documents.slice(0, 5)} />
              </div>
            )}
          </div>
        )}

        {view === 'library' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
              <p className="text-gray-600">{documents.length} documents indexed</p>
            </div>
            <DocumentLibrary documents={documents} onDelete={handleDeleteDocument} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
