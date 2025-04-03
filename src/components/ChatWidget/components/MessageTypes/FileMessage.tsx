
import React from 'react';
import { FileIcon } from 'lucide-react';

export interface FileMessageProps {
  data: Record<string, any>;
}

const FileMessage: React.FC<FileMessageProps> = ({ data }) => {
  const fileName = data.fileName || "File";
  const fileUrl = data.fileUrl || "#";

  return (
    <a 
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
    >
      <div className="mr-2">
        <FileIcon size={20} className="text-blue-500" />
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="text-sm font-medium text-blue-600 truncate">{fileName}</p>
      </div>
    </a>
  );
};

export default FileMessage;
