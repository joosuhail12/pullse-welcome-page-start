
import React from 'react';
import { Paperclip, Loader2, CheckCircle2 } from 'lucide-react';

interface FileMessageProps {
  text: string;
  fileName?: string;
  renderText: (text: string) => React.ReactNode;
  uploading?: boolean;
}

const FileMessage = ({ text, fileName, renderText, uploading = false }: FileMessageProps) => {
  const [uploaded, setUploaded] = React.useState(false);
  
  // Simulate successful upload after uploading state completes
  React.useEffect(() => {
    if (!uploading && fileName && !uploaded) {
      setTimeout(() => setUploaded(true), 500);
      
      // Reset animation after it plays
      const timer = setTimeout(() => setUploaded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [uploading, fileName, uploaded]);

  return (
    <div className="flex flex-col">
      {renderText(text)}
      <div 
        className={`mt-2 p-3 rounded-lg flex items-center transition-all duration-300
          ${uploading ? 'bg-gray-100/80 animate-pulse' : 'bg-gray-100/90 hover:bg-gray-200/80'} 
          ${uploaded ? 'file-upload-success' : ''}
          border border-gray-200/80 shadow-sm`}
      >
        {uploading ? (
          <Loader2 size={18} className="mr-2 text-vivid-purple animate-spin" />
        ) : uploaded ? (
          <CheckCircle2 size={18} className="mr-2 text-green-500 animate-bounce" />
        ) : (
          <Paperclip size={18} className="mr-2 text-vivid-purple/80" />
        )}
        <span className="text-sm font-medium text-blue-600 truncate max-w-[200px] hover:underline">
          {fileName || 'File'}
        </span>
        {uploading && (
          <span className="ml-2 text-xs text-gray-600 font-medium">Uploading...</span>
        )}
      </div>
    </div>
  );
};

export default FileMessage;
