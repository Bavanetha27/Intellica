import { useState, useRef } from 'react';
import { Upload, FileText, Image, Music, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing?: boolean;
}

export function FileUpload({ onFilesSelected, isProcessing = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card padding="lg" className={isDragging ? 'border-2 border-blue-500 border-dashed' : 'border-2 border-gray-300 border-dashed'}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className="cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.bmp,.mp3,.wav,.ogg,.m4a,.webm"
        />

        <div className="flex flex-col items-center justify-center py-12">
          {isProcessing ? (
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          ) : (
            <Upload className="w-16 h-16 text-gray-400 mb-4" />
          )}

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isProcessing ? 'Processing files...' : 'Drag & drop your files here'}
          </h3>

          <p className="text-gray-500 mb-4">or</p>

          <Button variant="primary" size="lg" disabled={isProcessing}>
            Browse Files
          </Button>

          <div className="mt-8 flex flex-wrap justify-center gap-6 max-w-2xl">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-5 h-5" />
              <span className="text-sm">PDF, DOCX, TXT</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Image className="w-5 h-5" />
              <span className="text-sm">JPG, PNG, GIF</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Music className="w-5 h-5" />
              <span className="text-sm">MP3, WAV, OGG</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
