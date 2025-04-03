
import React from 'react';

interface TextMessageProps {
  text: string;
  renderText: (text: string) => React.ReactNode;
}

const TextMessage = ({ text, renderText }: TextMessageProps) => {
  return (
    <p className="text-base leading-relaxed tracking-wide">{renderText(text)}</p>
  );
};

export default TextMessage;
