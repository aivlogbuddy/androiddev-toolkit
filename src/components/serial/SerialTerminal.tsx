import { useState, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SerialTerminalProps {
  connectionId: string;
  port: string;
  baudRate: number;
  onClose: () => void;
}

export function SerialTerminal({ connectionId, port, baudRate, onClose }: SerialTerminalProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-read from serial port (polling)
  useEffect(() => {
    const readFromPort = async () => {
      try {
        const result = await invoke<string>('serial_read', { sessionId: connectionId });
        if (result) {
          setOutput((prev) => [...prev, result]);
        }
      } catch (e) {
        // Silently ignore read errors during polling
      }
    };

    setIsReading(true);
    pollingRef.current = setInterval(readFromPort, 500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      setIsReading(false);
    };
  }, [connectionId]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const sendCommand = useCallback(() => {
    if (!command.trim()) return;

    setError(null);
    setIsSending(true);

    const cmd = command;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    invoke<string>('serial_write', { sessionId: connectionId, data: cmd })
      .then(() => {
        setOutput((prev) => [...prev, `> ${cmd}`]);
        setCommand('');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        setIsSending(false);
      });
  }, [command, connectionId]);

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
      } else if (e.key === 'Enter' && !isSending) {
        sendCommand();
      }
    },
    [history, isSending, sendCommand]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      await invoke('disconnect_serial', { sessionId: connectionId });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [connectionId, onClose]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="text-green-400 text-sm font-mono">SERIAL TERMINAL</div>
          <span className="text-xs text-gray-500 font-mono">
            {port} @ {baudRate} baud
          </span>
          {isReading && (
            <span className="text-xs text-green-600 font-mono">● READING</span>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900 text-red-200 text-sm font-mono">
          ERROR: {error}
        </div>
      )}

      {/* Output Display - Classic terminal look */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm bg-black"
      >
        {output.map((line, i) => (
          <div key={i} className="text-green-400 whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {output.length === 0 && (
          <div className="text-green-600">
            Serial monitor ready. Connect to start receiving data...
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="flex items-center gap-2 p-3 bg-gray-900 border-t border-gray-700">
        <span className="text-green-500 font-mono">{'>'}</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="flex-1 bg-black text-green-400 font-mono text-sm px-3 py-2 rounded border border-green-900 focus:border-green-500 focus:outline-none disabled:opacity-50 placeholder-green-800"
          placeholder="Enter command..."
        />
        <button
          onClick={sendCommand}
          disabled={isSending || !command.trim()}
          className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {isSending ? 'SEND' : 'SEND'}
        </button>
      </div>
    </div>
  );
}

export default SerialTerminal;