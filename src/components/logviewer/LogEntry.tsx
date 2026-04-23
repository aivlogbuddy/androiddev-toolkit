import React from 'react';
import type { LogEntry } from '../../stores/logStore';

interface LogEntryProps {
  entry: LogEntry;
}

const LEVEL_COLORS: Record<LogEntry['level'], string> = {
  debug: 'bg-gray-500',
  info: 'bg-blue-500',
  warn: 'bg-yellow-500',
  error: 'bg-red-500',
};

const LEVEL_TEXT_COLORS: Record<LogEntry['level'], string> = {
  debug: 'text-gray-400',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
};

export const LogEntryRow: React.FC<LogEntryProps> = ({ entry }) => {
  return (
    <div className="flex items-start gap-3 px-4 py-1 hover:bg-gray-800 font-mono text-xs">
      <span className="text-gray-500 shrink-0">{formatTimestamp(entry.timestamp)}</span>
      <span className={`${LEVEL_COLORS[entry.level]} text-white px-1.5 py-0.5 rounded text-xs shrink-0 uppercase`}>
        {entry.level}
      </span>
      <span className="text-blue-400 shrink-0">{entry.tag}</span>
      <span className="text-gray-100 break-all">{entry.message}</span>
    </div>
  );
};