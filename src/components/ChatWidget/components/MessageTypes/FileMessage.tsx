
import React from 'react';
import { FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileMessageProps {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  metadata?: Record<string, any>;
}

const FileMessage: React.FC<FileMessageProps> = ({
  fileName,
  fileUrl,
  fileType = 'application/octet-stream',
  fileSize = 0,
  metadata
}) => {
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-message">
      {isImage ? (
        <div className="max-w-xs">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img 
              src={fileUrl} 
              alt={fileName} 
              className="max-w-full rounded-lg object-cover border border-gray-100 shadow-sm" 
            />
          </a>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{fileName}</span>
            <span>{formatFileSize(fileSize)}</span>
          </div>
        </div>
      ) : (
        <div className={cn(
          "flex items-center bg-white p-2 rounded-md border border-gray-200",
          isPDF ? "max-w-full" : "max-w-[250px]"
        )}>
          <div className="mr-3 text-gray-500">
            <FileIcon size={24} />
          </div>
          
          <div className="flex-grow overflow-hidden">
            <div className="text-sm font-medium truncate">{fileName}</div>
            <div className="text-xs text-gray-500">{formatFileSize(fileSize)}</div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 h-8 w-8"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <Download size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileMessage;
