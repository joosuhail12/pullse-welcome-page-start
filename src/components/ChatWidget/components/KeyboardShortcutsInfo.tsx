
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface KeyboardShortcutProps {
  key: string;
  description: string;
  category?: 'navigation' | 'messages' | 'search' | 'general';
}

interface KeyboardShortcutsInfoProps {
  shortcuts?: KeyboardShortcutProps[];
  compact?: boolean;
}

const DEFAULT_SHORTCUTS: KeyboardShortcutProps[] = [
  { key: 'Alt + /', description: 'Focus search', category: 'search' },
  { key: 'Alt + End', description: 'Scroll to latest messages', category: 'navigation' },
  { key: 'Alt + Home', description: 'Load older messages', category: 'navigation' },
  { key: 'Alt + Enter', description: 'Send message', category: 'messages' },
  { key: 'Alt + R', description: 'Quick reply to last message', category: 'messages' },
  { key: 'Esc', description: 'Close search', category: 'search' },
];

const KeyboardShortcutsInfo: React.FC<KeyboardShortcutsInfoProps> = ({ shortcuts = [], compact = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const shortcutsToShow = shortcuts.length > 0 ? shortcuts : DEFAULT_SHORTCUTS;
  
  // For compact mode, only show a subset of shortcuts
  const compactShortcuts = compact 
    ? shortcutsToShow.slice(0, 3) 
    : shortcutsToShow;

  return (
    <div className="flex justify-end pr-3" aria-hidden="true">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="text-gray-500 p-1 hover:text-vivid-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-vivid-purple rounded-full"
              aria-label="Keyboard shortcuts"
              onClick={() => compact && setIsDialogOpen(true)}
            >
              <Info size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="p-2 max-w-xs">
            <div className="text-sm">
              <h3 className="font-semibold mb-1">Keyboard Shortcuts</h3>
              <ul className="space-y-1">
                {compactShortcuts.map((shortcut, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{shortcut.key}</kbd>
                    <span>{shortcut.description}</span>
                  </li>
                ))}
              </ul>
              {compact && (
                <div className="mt-2 text-xs text-center">
                  <button 
                    onClick={() => setIsDialogOpen(true)} 
                    className="text-vivid-purple hover:underline"
                  >
                    View all shortcuts
                  </button>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Full keyboard shortcuts dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="hidden">Open</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-semibold">Keyboard Shortcuts</DialogTitle>
          
          <div className="mt-4 grid gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 text-vivid-purple">Navigation</h3>
              <div className="grid gap-2">
                {shortcutsToShow.filter(s => !s.category || s.category === 'navigation').map((shortcut, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono min-w-[80px] text-center">{shortcut.key}</kbd>
                    <span className="flex-1 ml-4">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-vivid-purple">Messages</h3>
              <div className="grid gap-2">
                {shortcutsToShow.filter(s => s.category === 'messages').map((shortcut, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono min-w-[80px] text-center">{shortcut.key}</kbd>
                    <span className="flex-1 ml-4">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-vivid-purple">Search</h3>
              <div className="grid gap-2">
                {shortcutsToShow.filter(s => s.category === 'search').map((shortcut, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono min-w-[80px] text-center">{shortcut.key}</kbd>
                    <span className="flex-1 ml-4">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KeyboardShortcutsInfo;
