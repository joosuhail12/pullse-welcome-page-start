
import React from 'react';
import { Message } from '../types';
import { Paperclip, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../utils/validation';

interface MessageBubbleProps {
  message: Message;
  setMessageText?: (text: string) => void;
  onReact?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  highlightSearchTerm?: (text: string, term: string) => { text: string; highlighted: boolean }[];
  searchTerm?: string;
}

const MessageBubble = ({ 
  message, 
  setMessageText, 
  onReact,
  highlightSearchTerm,
  searchTerm
}: MessageBubbleProps) => {
  // Sanitize any text content before displaying
  const sanitizedText = message.text ? sanitizeInput(message.text) : '';
  
  // Handle message reaction
  const handleReaction = (reaction: 'thumbsUp' | 'thumbsDown') => {
    if (onReact) {
      onReact(message.id, reaction);
    }
  };

  // Render text with highlighting when search is active
  const renderText = (text: string) => {
    if (highlightSearchTerm && searchTerm) {
      const parts = highlightSearchTerm(text, searchTerm);
      return (
        <>
          {parts.map((part, i) => 
            part.highlighted 
              ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part.text}</mark> 
              : <React.Fragment key={i}>{part.text}</React.Fragment>
          )}
        </>
      );
    }
    return text;
  };
  
  const renderMessage = () => {
    switch (message.type) {
      case 'file':
        return (
          <div className="flex flex-col">
            {renderText(sanitizedText)}
            <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
              <Paperclip size={16} className="mr-2" />
              <span className="text-sm text-blue-600 underline">
                {message.fileName ? sanitizeInput(message.fileName) : 'File'}
              </span>
            </div>
          </div>
        );
      
      case 'card':
        if (!message.cardData) return <p>{renderText(sanitizedText)}</p>;
        
        // Sanitize card data
        const cardTitle = message.cardData.title ? sanitizeInput(message.cardData.title) : '';
        const cardDesc = message.cardData.description ? sanitizeInput(message.cardData.description) : '';
        
        return (
          <Card className="w-full max-w-xs mt-2 shadow-sm">
            {message.cardData.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={message.cardData.imageUrl} 
                  alt={cardTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <h4 className="font-semibold">{cardTitle}</h4>
              <p className="text-sm text-gray-600 mt-1">{cardDesc}</p>
              
              {message.cardData.buttons && message.cardData.buttons.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {message.cardData.buttons.map((button, i) => (
                    <Button 
                      key={i} 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                    >
                      {sanitizeInput(button.text)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'quick_reply':
        return (
          <div className="flex flex-col">
            {renderText(sanitizedText)}
            {message.quickReplies && message.quickReplies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.quickReplies.map((reply, i) => (
                  <Button 
                    key={i} 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs py-1.5 h-auto"
                    onClick={() => {
                      if (setMessageText) {
                        // Sanitize the quick reply text before setting
                        setMessageText(sanitizeInput(reply.text));
                      }
                    }}
                  >
                    {sanitizeInput(reply.text)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'status':
        return (
          <div className="bg-gray-100 py-1.5 px-4 rounded-full text-xs text-gray-500 text-center shadow-sm">
            {renderText(sanitizedText)}
          </div>
        );
      
      case 'text':
      default:
        return <p className="leading-relaxed">{renderText(sanitizedText)}</p>;
    }
  };

  // Render reaction buttons for system messages only
  const renderReactionButtons = () => {
    if (message.sender === 'system' && onReact) {
      return (
        <div className="flex gap-2 mt-1.5">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${message.reaction === 'thumbsUp' ? 'bg-green-100' : ''}`}
            onClick={() => handleReaction('thumbsUp')}
          >
            <ThumbsUp size={14} className={message.reaction === 'thumbsUp' ? 'text-green-600' : 'text-gray-500'} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${message.reaction === 'thumbsDown' ? 'bg-red-100' : ''}`}
            onClick={() => handleReaction('thumbsDown')}
          >
            <ThumbsDown size={14} className={message.reaction === 'thumbsDown' ? 'text-red-600' : 'text-gray-500'} />
          </Button>
        </div>
      );
    }
    return null;
  };

  if (message.sender === 'status') {
    return (
      <div className="w-full flex justify-center">
        {renderMessage()}
      </div>
    );
  }

  return (
    <div 
      className={`max-w-[80%] ${
        message.sender === 'user' 
          ? 'chat-message-user' 
          : 'chat-message-system'
      }`}
    >
      {renderMessage()}
      <div className="flex justify-between items-center">
        <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {renderReactionButtons()}
      </div>
    </div>
  );
};

export default MessageBubble;
