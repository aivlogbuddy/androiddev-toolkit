import { useState, useEffect, useRef, useCallback } from 'react';

export interface ADBLogcatProps {
  deviceId: string;
  buffer?: 'main' | 'system' | 'crash';
}

interface LogEntry {
  id: number;
  time: string;
  tag: string;
  message: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E' | 'F';
}

export function ADBLogcat({ deviceId, buffer = 'main' }: ADBLogcatProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextId, setNextId] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseLogcatLine = useCallback((line: string): LogEntry | null => {
    // Format: MM-DD HH:MM:SS.mmm  TAGG  LEVEL: MESSAGE
    const match = line.match(/^(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+(\S+)\s+([VIWDwarf]):\s*(.*)$/);
    if (!match) return null;
    return {
      id: nextId,
      time: match[1],
      tag: match[2],
      message: match[4],
      level: match[3] as LogEntry['level'],
    };
  }, [nextId]);

  const fetchLogs = useCallback(() => {
    if (isPaused) return;

    // Placeholder: actual logcat fetching via Tauri command
    const mockLines = [
      `04-24 10:30:15.123  ActivityManager  I: Starting activity: Intent { act=android.intent.action.MAIN }`,
      `04-24 10:30:15.456  WindowManager  D: Focus changed: AppWindowToken`,
      `04-24 10:30:16.789  SystemServer  W: Slow operation: took 250ms`,
    ];

    const newEntries = mockLines
      .map(parseLogcatLine)
      .filter((e): e is LogEntry => e !== null);

    if (newEntries.length > 0) {
      setNextId((prev) => prev + newEntries.length);
      setLogs((prev) => [...prev, ...newEntries].slice(-500));
    }
  }, [isPaused, parseLogcatLine]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, [isPaused, fetchLogs]);

  useEffect(() => {
    if (!isPaused && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const clearLogs = () => {
    setLogs([]);
    setNextId(0);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'V': return 'text-gray-400';
      case 'D': return 'text-blue-400';
      case 'I': return 'text-green-400';
      case 'W': return 'text-yellow-400';
      case 'E': return 'text-red-400';
      case 'F': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-gray-200 text-sm">Logcat</span>
          <span className="text-xs text-gray-500">{deviceId} / {buffer}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isPaused
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Log Display */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {isPaused ? 'Paused' : 'Waiting for logs...'}
          </div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className="flex hover:bg-gray-800 px-2 py-0.5">
              <span className="text-gray-500 w-28 flex-shrink-0">{entry.time}</span>
              <span className={`w-16 flex-shrink-0 ${getLevelColor(entry.level)}`}>
                {entry.level}
              </span>
              <span className="text-cyan-400 w-32 flex-shrink-0 truncate">{entry.tag}</span>
              <span className="text-gray-300 flex-1 whitespace-pre-wrap">{entry.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ADBLogcat;
