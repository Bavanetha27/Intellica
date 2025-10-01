import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Clock, Hash } from 'lucide-react';
import type { Citation } from '../types';
import { Card } from './Card';

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export function CitationCard({ citation, index }: CitationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card padding="sm" hover className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {index}
            </span>
            <span className="font-medium text-gray-900 truncate">{citation.documentName}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
            {citation.page && (
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span>Page {citation.page}</span>
              </div>
            )}
            {citation.timestamp !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{Math.floor(citation.timestamp / 60)}:{String(Math.floor(citation.timestamp % 60)).padStart(2, '0')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Score: {(citation.relevanceScore * 100).toFixed(1)}%</span>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
              {citation.content}
            </div>
          )}
        </div>

        <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
    </Card>
  );
}
