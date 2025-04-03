
import React from 'react';
import { Paperclip } from 'lucide-react';

export interface FileMessageProps {
  metadata?: Record<string, any>;
}

const FileMessage: React.FC<FileMessageProps> = ({ metadata }) => {
  if (!metadata) return null;
  
  const fileName = metadata.fileName || 'File';
  const fileUrl = metadata.fileUrl || '#';
  const fileSize = metadata.fileSize;
  const fileType = metadata.fileType;

  return (
    <div className="flex flex-col">
      <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
        <Paperclip size={16} className="mr-2" />
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-blue-600 underline"
        >
          {fileName}
          {fileSize && <span className="text-gray-500 ml-2 text-xs">{fileSize}</span>}
        </a>
      </div>
      {fileType && (
        <div className="text-xs text-gray-500 mt-1">
          Type: {fileType}
        </div>
      )}
    </div>
  );
};

export default FileMessage;
