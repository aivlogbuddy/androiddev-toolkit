import { useState } from 'react';

export interface SSHTerminalProps {
  sessionId: string;
  deviceId: string;
  onClose: () => void;
}

export function SSHTerminal({ sessionId, deviceId, onClose }: SSHTerminalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setError(null);
    // Placeholder: actual xterm.js integration in Task 12
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    // Placeholder: actual disconnect logic in Task 12
    setIsConnected(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-200">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Connect
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Terminal Component (Placeholder) */}
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">Terminal View</p>
          <p className="text-sm">xterm.js integration in Task 12</p>
        </div>
      </div>
    </div>
  );
}

export default SSHTerminal;
