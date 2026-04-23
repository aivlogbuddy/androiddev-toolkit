import React, { useState } from 'react';
import type { Filter } from '../../stores/logStore';

interface FilterBarProps {
  filters: Filter[];
  onAddFilter: (filter: Omit<Filter, 'id'>) => void;
  onRemoveFilter: (id: string) => void;
  onToggleFilter: (id: string) => void;
  onClearFilters: () => void;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onToggleFilter,
  onClearFilters,
}) => {
  const [input, setInput] = useState('');
  const [isRegex, setIsRegex] = useState(false);

  const handleAdd = () => {
    if (!input.trim()) return;

    const pattern = input.trim();
    const isExclude = pattern.startsWith('-');
    const cleanPattern = isExclude ? pattern.slice(1) : pattern;
    const finalPattern = isRegex ? `/${cleanPattern}/` : cleanPattern;

    const colorIndex = filters.length % COLORS.length;

    onAddFilter({
      pattern: finalPattern,
      color: COLORS[colorIndex],
      enabled: true,
      isRegex,
      isExclude,
    });

    setInput('');
    setIsRegex(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-3">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="tag:ActivityManager, level:Error, -tag:system, /regex/"
          className="flex-1 bg-gray-900 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
        />
        <label className="flex items-center gap-2 text-gray-300 px-3 py-2">
          <input
            type="checkbox"
            checked={isRegex}
            onChange={(e) => setIsRegex(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Regex</span>
        </label>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
        >
          Add
        </button>
        <button
          onClick={onClearFilters}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded font-medium"
        >
          Clear
        </button>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-1 px-2 py-1 rounded text-sm"
              style={{ backgroundColor: `${filter.color}20`, borderLeft: `3px solid ${filter.color}` }}
            >
              <input
                type="checkbox"
                checked={filter.enabled}
                onChange={() => onToggleFilter(filter.id)}
                className="rounded"
              />
              <span className="text-gray-200 font-mono">{filter.pattern}</span>
              {filter.isExclude && (
                <span className="text-xs text-gray-400 ml-1">(exclude)</span>
              )}
              <button
                onClick={() => onRemoveFilter(filter.id)}
                className="ml-1 text-gray-400 hover:text-white font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};