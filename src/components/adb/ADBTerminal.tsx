import { useState, useCallback } from 'react';

export interface ADBTerminalProps {
  deviceId: string;
  onClose: () => void;
}

export function ADBTerminal({ deviceId, onClose }: ADBTerminalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const executeCommand = useCallback(() => {
    if (!command.trim()) return;

    setError(null);
    setIsExecuting(true);
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Placeholder: actual ADB shell execution via Tauri command
    setTimeout(() => {
      setOutput((prev) => [...prev, `$ ${command}`, `Output for: ${command}`]);
      setIsExecuting(false);
      setCommand('');
    }, 500);
  }, [command]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const newIndex = prev < history.length - 1 ? prev + 1 : prev;
          if (newIndex >= 0 && history[history.length - 1 - newIndex]) {
            setCommand(history[history.length - 1 - newIndex]);
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : -1;
          if (newIndex === -1) {
            setCommand('');
          } else if (history[history.length - 1 - newIndex]) {
            setCommand(history[history.length - 1 - newIndex]);
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && !isExecuting) {
        executeCommand();
      }
    },
    [history, isExecuting, executeCommand]
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-gray-200 text-sm font-mono">ADB Shell</div>
          <span className="text-xs text-gray-500">{deviceId}</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Output Display */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {output.map((line, i) => (
          <div key={i} className="text-gray-300 whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {output.length === 0 && (
          <div className="text-gray-500">Ready. Enter a command to execute.</div>
        )}
      </div>

      {/* Command Input */}
      <div className="flex items-center gap-2 p-4 bg-gray-800 border-t border-gray-700">
        <span className="text-green-500 font-mono">{'>'}</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          className="flex-1 bg-gray-900 text-gray-200 font-mono text-sm px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          placeholder="Enter ADB shell command..."
        />
        <button
          onClick={executeCommand}
          disabled={isExecuting || !command.trim()}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>
      </div>
    </div>
  );
}

export default ADBTerminal;
