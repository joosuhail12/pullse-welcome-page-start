
import React from 'react';
import BaseStatusMessage from '../StatusMessage';

interface StatusMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
}

const StatusMessage = ({ text, renderText }: StatusMessageProps) => {
  return <BaseStatusMessage text={text} renderText={renderText} />;
};

export default StatusMessage;
