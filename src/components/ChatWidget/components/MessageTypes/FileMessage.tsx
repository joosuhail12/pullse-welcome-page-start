
import React from 'react';
import { Paperclip } from 'lucide-react';
import { sanitizeInput } from '../../utils/validation';

interface FileMessageProps {
  text: string;
  fileName?: string;
  renderText: (text: string) => React.ReactNode;
}

const FileMessage = ({ text, fileName, renderText }: FileMessageProps) => {
  return (
    <div className="flex flex-col">
      {renderText(text)}
      <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
        <Paperclip size={16} className="mr-2" />
        <span className="text-sm text-blue-600 underline">
          {fileName ? sanitizeInput(fileName) : 'File'}
        </span>
      </div>
    </div>
  );
};

export default FileMessage;
