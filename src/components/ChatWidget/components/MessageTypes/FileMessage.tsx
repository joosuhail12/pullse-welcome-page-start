
import React from 'react';
import { FileText, Download, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FileMessageProps {
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  metadata?: Record<string, any>;
}

const FileMessage: React.FC<FileMessageProps> = ({ 
  fileName, 
  fileUrl, 
  fileType,
  fileSize,
  metadata
}) => {
  const fileNameToUse = fileName || metadata?.fileName || 'File';
  const fileUrlToUse = fileUrl || metadata?.fileUrl;
  const fileTypeToUse = fileType || metadata?.fileType || getFileTypeFromName(fileNameToUse);
  const fileSizeToUse = fileSize || metadata?.fileSize;

  const isImage = fileTypeToUse?.startsWith('image/') || fileNameToUse.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  
  // Format file size
  const formattedSize = fileSizeToUse ? formatFileSize(fileSizeToUse) : '';
  
  return (
    <div className="w-full">
      {isImage && fileUrlToUse ? (
        <div className="mb-2">
          <img 
            src={fileUrlToUse} 
            alt={fileNameToUse}
            className="max-w-[250px] max-h-[200px] rounded-md object-contain"
            loading="lazy"
          />
        </div>
      ) : null}
      
      <div className="flex items-center p-2 rounded-md bg-gray-50 border border-gray-200">
        <div className="mr-2 p-2 bg-gray-100 rounded-md">
          {getFileIcon(fileTypeToUse)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate" title={fileNameToUse}>
            {fileNameToUse}
          </p>
          {formattedSize && (
            <p className="text-xs text-gray-500">{formattedSize}</p>
          )}
        </div>
        
        {fileUrlToUse && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => window.open(fileUrlToUse, '_blank')}
            title="Download"
          >
            <Download size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

function getFileIcon(fileType?: string) {
  if (!fileType) return <File size={20} className="text-gray-400" />;
  
  if (fileType.startsWith('image/')) {
    return <Image size={20} className="text-blue-500" />;
  }
  
  if (fileType.includes('pdf')) {
    return <FileText size={20} className="text-red-500" />;
  }
  
  if (fileType.includes('word') || fileType.includes('doc')) {
    return <FileText size={20} className="text-blue-700" />;
  }
  
  if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) {
    return <FileText size={20} className="text-green-600" />;
  }
  
  return <File size={20} className="text-gray-600" />;
}

function getFileTypeFromName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'csv':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileMessage;
