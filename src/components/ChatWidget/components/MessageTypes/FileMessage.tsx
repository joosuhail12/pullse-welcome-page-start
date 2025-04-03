
import React from 'react';
import { Paperclip } from 'lucide-react';
import { sanitizeInput } from '../../utils/validation';

export interface FileMessageProps {
  metadata: Record<string, any>;
}

const FileMessage: React.FC<FileMessageProps> = ({ metadata }) => {
  if (!metadata) return null;
  
  return (
    <div className="flex flex-col">
      {metadata.text && <p className="mb-2">{sanitizeInput(metadata.text)}</p>}
      <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
        <Paperclip size={16} className="mr-2" />
        <a 
          href={metadata.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-blue-600 underline"
        >
          {metadata.fileName ? sanitizeInput(metadata.fileName) : 'File'}
        </a>
      </div>
    </div>
  );
};

export default FileMessage;
