
import React from 'react';
import { Paperclip, Loader2, CheckCircle2 } from 'lucide-react';

interface FileMessageProps {
  text?: string;
  fileName?: string;
  fileUrl?: string;
  renderText?: (text: string) => React.ReactNode;
  uploading?: boolean;
  metadata?: Record<string, any>;
}

const FileMessage = ({ text, fileName, fileUrl, renderText, uploading = false, metadata }: FileMessageProps) => {
  const [uploaded, setUploaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  
  // Handle metadata if provided
  const fileNameToUse = fileName || (metadata?.fileName as string) || 'File';
  const fileUrlToUse = fileUrl || (metadata?.fileUrl as string);
  const textToUse = text || (metadata?.text as string) || '';
  
  // Determine if the file is an image by checking the filename extension
  const isImage = fileUrlToUse && 
    fileNameToUse?.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null && 
    !imageError;
  
  // Simulate successful upload after uploading state completes
  React.useEffect(() => {
    if (!uploading && fileNameToUse && !uploaded) {
      setTimeout(() => setUploaded(true), 500);
      
      // Reset animation after it plays
      const timer = setTimeout(() => setUploaded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [uploading, fileNameToUse, uploaded]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Choose appropriate icon based on file type
  const getFileIcon = () => {
    if (uploading) {
      return <Loader2 size={18} className="mr-2 text-vivid-purple animate-spin" />;
    } else if (uploaded) {
      return <CheckCircle2 size={18} className="mr-2 text-green-500 animate-bounce" />;
    } else {
      return <Paperclip size={18} className="mr-2 text-vivid-purple/80" />;
    }
  };

  const renderTextContent = () => {
    if (!textToUse) return null;
    if (renderText) return renderText(textToUse);
    return textToUse;
  };

  return (
    <div className="flex flex-col">
      {renderTextContent()}
      
      {(fileUrlToUse || fileNameToUse) && (
        <div 
          className={`mt-2 p-3 rounded-lg transition-all duration-300
            ${uploading ? 'bg-gray-100/80 animate-pulse' : 'bg-gray-100/90 hover:bg-gray-200/80'} 
            ${uploaded ? 'file-upload-success' : ''}
            border border-gray-200/80 shadow-sm`}
        >
          {isImage && fileUrlToUse ? (
            <div className="space-y-2">
              <div className="flex items-center">
                {getFileIcon()}
                <span className="text-sm font-medium text-blue-600 truncate max-w-[200px] hover:underline">
                  {fileNameToUse}
                </span>
                {uploading && (
                  <span className="ml-2 text-xs text-gray-600 font-medium">Uploading...</span>
                )}
              </div>
              <div className="relative rounded-md overflow-hidden bg-white border border-gray-200">
                <img 
                  src={fileUrlToUse} 
                  alt={fileNameToUse} 
                  className="max-w-full max-h-[200px] object-contain"
                  onError={handleImageError}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              {getFileIcon()}
              <span className="text-sm font-medium text-blue-600 truncate max-w-[200px] hover:underline">
                {fileNameToUse}
              </span>
              {uploading && (
                <span className="ml-2 text-xs text-gray-600 font-medium">Uploading...</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileMessage;
