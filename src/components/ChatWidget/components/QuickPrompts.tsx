
import React from 'react';
import { Sparkles } from 'lucide-react';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';
import { quickPromptButtonStyles, quickPromptTextStyles } from '../utils/buttonStyles';

interface QuickPromptsProps {
  prompts: string[];
  typingComplete: boolean;
  onPromptSelect: (prompt: string) => void;
  config: ChatWidgetConfig;
}

const QuickPrompts = ({ prompts, typingComplete, onPromptSelect, config }: QuickPromptsProps) => {
  if (!prompts || prompts.length === 0) return null;
  
  const handlePromptSelect = (prompt: string) => {
    // Dispatch event for prompt selection
    dispatchChatEvent('quickPrompt:selected', { prompt }, config);
    
    // Call the callback
    onPromptSelect(prompt);
  };

  return (
    <div className="mt-2 mb-4 transition-all duration-500" style={{
      opacity: typingComplete ? 1 : 0,
      transform: typingComplete ? 'translateY(0)' : 'translateY(8px)'
    }}>
      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
        <Sparkles size={14} className="text-vivid-purple-500" /> 
        Quick questions
      </p>
      <div className="flex flex-col gap-2">
        {prompts.slice(0, 3).map((prompt, index) => (
          <button
            key={index}
            onClick={() => handlePromptSelect(prompt)}
            className={quickPromptButtonStyles()}
            style={{ animationDelay: `${index * 100}ms` }}
            aria-label={`Ask: ${prompt}`}
          >
            <span className={quickPromptTextStyles()}>
              {prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
