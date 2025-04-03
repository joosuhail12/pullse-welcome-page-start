
import React from 'react';
import { isTestMode } from '../utils/testMode';

/**
 * Creates a test badge component that displays when in test mode
 * @returns A React element for the test badge or null
 */
const TestBadge: React.FC = () => {
  if (!isTestMode()) return null;
  
  return (
    <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
      TEST
    </div>
  );
};

export default TestBadge;
