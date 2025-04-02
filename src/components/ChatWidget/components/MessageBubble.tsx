
import React from 'react';
import { Message } from '../types';
import { Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  setMessageText?: (text: string) => void;
}

const MessageBubble = ({ message, setMessageText }: MessageBubbleProps) => {
  const renderMessage = () => {
    switch (message.type) {
      case 'file':
        return (
          <div className="flex flex-col">
            <p>{message.text}</p>
            <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
              <Paperclip size={16} className="mr-2" />
              <span className="text-sm text-blue-600 underline">{message.fileName}</span>
            </div>
          </div>
        );
      
      case 'card':
        if (!message.cardData) return <p>{message.text}</p>;
        
        return (
          <Card className="w-full max-w-xs mt-2">
            {message.cardData.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={message.cardData.imageUrl} 
                  alt={message.cardData.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-3">
              <h4 className="font-semibold">{message.cardData.title}</h4>
              <p className="text-sm text-gray-600">{message.cardData.description}</p>
              
              {message.cardData.buttons && message.cardData.buttons.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {message.cardData.buttons.map((button, i) => (
                    <Button 
                      key={i} 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                    >
                      {button.text}
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
            <p>{message.text}</p>
            {message.quickReplies && message.quickReplies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.quickReplies.map((reply, i) => (
                  <Button 
                    key={i} 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs py-1 h-auto"
                    onClick={() => {
                      if (setMessageText) {
                        setMessageText(reply.text);
                      }
                    }}
                  >
                    {reply.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'status':
        return (
          <div className="bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-500 text-center">
            {message.text}
          </div>
        );
      
      case 'text':
      default:
        return <p>{message.text}</p>;
    }
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
      className={`max-w-[80%] rounded-lg p-3 ${
        message.sender === 'user' 
          ? 'bg-vivid-purple text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}
    >
      {renderMessage()}
      <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default MessageBubble;
