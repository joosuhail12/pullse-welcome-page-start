
import React from 'react';
import { Image } from 'lucide-react';

interface TextMessageProps {
  text: string;
  renderText?: (text: string) => string;
  highlightText?: string;
  attachmentType?: 'image' | 'pdf';
  attachmentUrl?: string;
  textColor?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({
  text,
  renderText,
  highlightText,
  attachmentType,
  attachmentUrl,
  textColor
}) => {
  const processedText = renderText ? renderText(text) : text;

  return (
    <div className="space-y-2">
      {/* Text content */}
      <div className="whitespace-pre-wrap break-words text-left" style={{ color: textColor }}>
        {processedText}
      </div>

      {/* Attachment preview */}
      {attachmentUrl && (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200/50">
          {attachmentType === 'image' ? (
            <img
              src={attachmentUrl}
              alt="Attachment"
              className="max-h-[200px] w-auto object-contain"
            />
          ) : attachmentType === 'pdf' && (
            <div className="flex items-center gap-2 p-2 bg-gray-50">
              <Image size={20} className="text-gray-500" />
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextMessage;
