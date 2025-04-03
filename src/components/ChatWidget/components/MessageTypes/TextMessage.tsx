
import React from 'react';

export interface TextMessageProps {
  text: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ text }) => {
  return (
    <p className="whitespace-pre-wrap break-words">{text}</p>
  );
};

export default TextMessage;
