
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KeyboardShortcutProps {
  key: string;
  description: string;
}

interface KeyboardShortcutsInfoProps {
  shortcuts?: KeyboardShortcutProps[];
}

const KeyboardShortcutsInfo: React.FC<KeyboardShortcutsInfoProps> = ({ shortcuts = [] }) => {
  // Default keyboard shortcuts if none provided
  const defaultShortcuts = [
    { key: 'Alt + /', description: 'Focus search' },
    { key: 'Alt + End', description: 'Scroll to latest messages' },
    { key: 'Alt + Home', description: 'Load older messages' },
    { key: 'Alt + Enter', description: 'Send message' },
    { key: 'Esc', description: 'Close search' }
  ];

  const shortcutsToShow = shortcuts.length > 0 ? shortcuts : defaultShortcuts;

  return (
    <div className="flex justify-end pr-3" aria-hidden="true">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="text-gray-500 p-1 hover:text-vivid-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-vivid-purple"
              aria-label="Keyboard shortcuts"
            >
              <Info size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="p-2 max-w-xs">
            <div className="text-sm">
              <h3 className="font-semibold mb-1">Keyboard Shortcuts</h3>
              <ul className="space-y-1">
                {shortcutsToShow.map((shortcut, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{shortcut.key}</kbd>
                    <span>{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default KeyboardShortcutsInfo;
