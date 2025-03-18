
import React from 'react';

interface DisplayModeToggleProps {
  currentMode: 'cards' | 'list';
  onToggle: () => void;
}

export const DisplayModeToggle = ({ currentMode, onToggle }: DisplayModeToggleProps) => {
  return (
    <div className="flex justify-end mb-2">
      <button 
        onClick={onToggle}
        className="text-sm text-[#8B5CF6] border border-[#8B5CF6] rounded px-3 py-1 hover:bg-[#8B5CF6]/10"
      >
        Show as {currentMode === 'cards' ? 'List' : 'Cards'}
      </button>
    </div>
  );
};
