
import React from 'react';
import { Paperclip, Loader2 } from 'lucide-react';

interface FileMessageProps {
  text: string;
  fileName?: string;
  renderText: (text: string) => React.ReactNode;
  uploading?: boolean;
}

const FileMessage = ({ text, fileName, renderText, uploading = false }: FileMessageProps) => {
  return (
    <div className="flex flex-col">
      {renderText(text)}
      <div className={`mt-2 p-2 bg-gray-100 rounded-md flex items-center transition-all ${uploading ? 'animate-pulse' : ''}`}>
        {uploading ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <Paperclip size={16} className="mr-2" />
        )}
        <span className="text-sm text-blue-600 underline truncate max-w-[200px]">
          {fileName || 'File'}
        </span>
        {uploading && (
          <span className="ml-2 text-xs text-gray-500">Uploading...</span>
        )}
      </div>
    </div>
  );
};

export default FileMessage;
