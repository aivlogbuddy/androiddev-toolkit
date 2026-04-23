import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLogStore } from '../../stores/logStore';
import { FilterBar } from './FilterBar';
import { LogEntryRow } from './LogEntry';
import type { Filter } from '../../stores/logStore';

interface LogViewerProps {
  deviceId?: string;
}

const matchFilter = (entry: { tag: string; message: string }, filter: Filter): boolean => {
  let pattern = filter.pattern;

  // Handle regex delimiters
  if (filter.isRegex) {
    pattern = pattern.replace(/^\/|\/$/g, '');
    try {
      const regex = new RegExp(pattern);
      return regex.test(entry.tag) || regex.test(entry.message);
    } catch {
      return false;
    }
  }

  // Handle special filter prefixes
  if (pattern.startsWith('tag:')) {
    return entry.tag.includes(pattern.slice(4));
  }
  if (pattern.startsWith('level:')) {
    const levels = pattern.slice(6).split(',');
    return levels.some((l) => entry.tag.toLowerCase().includes(l.toLowerCase()));
  }
  if (pattern.startsWith('*:')) {
    const search = pattern.slice(2);
    return entry.tag.includes(search) || entry.message.includes(search);
  }

  // Default: match against tag and message
  return entry.tag.includes(pattern) || entry.message.includes(pattern);
};

export const LogViewer: React.FC<LogViewerProps> = ({ deviceId }) => {
  const { entries, filters, paused, addFilter, removeFilter, toggleFilter, setPaused, clearEntries } = useLogStore();
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasPaused = useRef(paused);

  // Filter entries by deviceId and active filters
  const filteredEntries = useMemo(() => {
    const deviceEntries = deviceId
      ? entries.filter((e) => e.deviceId === deviceId)
      : entries;

    const activeFilters = filters.filter((f) => f.enabled);

    if (activeFilters.length === 0) {
      return deviceEntries;
    }

    return deviceEntries.filter((entry) => {
      // Exclude filters are OR'd together first
      const excludeMatches = activeFilters
        .filter((f) => f.isExclude)
        .map((f) => matchFilter(entry, f));

      // If any exclude matches, entry is excluded
      if (excludeMatches.some(Boolean)) {
        return false;
      }

      // Include filters are AND'd together
      const includeMatches = activeFilters
        .filter((f) => !f.isExclude)
        .map((f) => matchFilter(entry, f));

      // All include filters must match
      return includeMatches.every(Boolean);
    });
  }, [entries, filters, deviceId]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredEntries, autoScroll]);

  // Track pause state changes
  useEffect(() => {
    if (!paused && wasPaused.current) {
      // Resumed - ensure scroll to bottom
      if (autoScroll && scrollRef.current) {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 50);
      }
    }
    wasPaused.current = paused;
  }, [paused, autoScroll]);

  const handleExport = () => {
    const content = filteredEntries
      .map((e) => {
        const ts = new Date(e.timestamp).toISOString();
        return `[${ts}] ${e.level.toUpperCase()} ${e.tag}: ${e.message}`;
      })
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <FilterBar
        filters={filters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onToggleFilter={toggleFilter}
        onClearFilters={() => filters.forEach((f) => removeFilter(f.id))}
      />

      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPaused(!paused)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              paused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
            } text-white`}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={clearEntries}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
          <span className="text-gray-400 text-sm">
            {filteredEntries.length} / {entries.length} entries
          </span>
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Export
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#111827' }}
      >
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {entries.length === 0 ? 'No log entries' : 'No entries match current filters'}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <LogEntryRow key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
};