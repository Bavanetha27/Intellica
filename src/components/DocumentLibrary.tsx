import { FileText, Image, Music, File, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Document } from '../types';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

interface DocumentLibraryProps {
  documents: Document[];
  onDelete?: (id: string) => void;
}

export function DocumentLibrary({ documents, onDelete }: DocumentLibraryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'text':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'image':
        return <Image className="w-6 h-6 text-green-600" />;
      case 'audio':
        return <Music className="w-6 h-6 text-purple-600" />;
      default:
        return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="info">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (documents.length === 0) {
    return (
      <Card padding="lg">
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No documents yet</p>
          <p className="text-sm mt-2">Upload your first document to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} padding="md" hover>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon(doc.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                {getStatusBadge(doc.status)}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
                <div>
                  <span className="uppercase">{doc.type}</span> • {formatSize(doc.size)}
                </div>
              </div>

              {doc.error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{doc.error}</span>
                </div>
              )}

              {doc.processedAt && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Processed at {formatDate(doc.processedAt)}</span>
                </div>
              )}
            </div>

            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(doc.id)}
                className="flex-shrink-0 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
