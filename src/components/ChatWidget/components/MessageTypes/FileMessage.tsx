
import React from 'react';
import { Paperclip, Loader2, CheckCircle2, FileIcon, ImageIcon } from 'lucide-react';

interface FileMessageProps {
  text: string;
  fileName?: string;
  fileUrl?: string;
  renderText: (text: string) => React.ReactNode;
  uploading?: boolean;
}

const FileMessage = ({ text, fileName, fileUrl, renderText, uploading = false }: FileMessageProps) => {
  const [uploaded, setUploaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  
  // Determine if the file is an image by checking the filename extension
  const isImage = fileUrl && 
    fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null && 
    !imageError;
  
  // Simulate successful upload after uploading state completes
  React.useEffect(() => {
    if (!uploading && fileName && !uploaded) {
      setTimeout(() => setUploaded(true), 500);
      
      // Reset animation after it plays
      const timer = setTimeout(() => setUploaded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [uploading, fileName, uploaded]);

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

  return (
    <div className="flex flex-col">
      {renderText(text)}
      
      <div 
        className={`mt-2 p-3 rounded-lg transition-all duration-300
          ${uploading ? 'bg-gray-100/80 animate-pulse' : 'bg-gray-100/90 hover:bg-gray-200/80'} 
          ${uploaded ? 'file-upload-success' : ''}
          border border-gray-200/80 shadow-sm`}
      >
        {isImage && fileUrl ? (
          <div className="space-y-2">
            <div className="flex items-center">
              {getFileIcon()}
              <span className="text-sm font-medium text-blue-600 truncate max-w-[200px] hover:underline">
                {fileName || 'Image'}
              </span>
              {uploading && (
                <span className="ml-2 text-xs text-gray-600 font-medium">Uploading...</span>
              )}
            </div>
            <div className="relative rounded-md overflow-hidden bg-white border border-gray-200">
              <img 
                src={fileUrl} 
                alt={fileName || 'Uploaded image'} 
                className="max-w-full max-h-[200px] object-contain"
                onError={handleImageError}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            {getFileIcon()}
            <span className="text-sm font-medium text-blue-600 truncate max-w-[200px] hover:underline">
              {fileName || 'File'}
            </span>
            {uploading && (
              <span className="ml-2 text-xs text-gray-600 font-medium">Uploading...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileMessage;
