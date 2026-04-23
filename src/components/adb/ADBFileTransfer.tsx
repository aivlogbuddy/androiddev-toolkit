import { useState, useCallback } from 'react';

export interface ADBFileTransferProps {
  deviceId: string;
  mode: 'push' | 'pull';
}

export function ADBFileTransfer({ deviceId, mode: initialMode }: ADBFileTransferProps) {
  const [mode, setMode] = useState<'push' | 'pull'>(initialMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remotePath, setRemotePath] = useState('');
  const [localPath, setLocalPath] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (mode === 'push') setIsDragging(true);
  }, [mode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (mode === 'push') {
      setLocalPath(file.path || file.name);
      // Placeholder: actual push logic via Tauri command
      simulateTransfer();
    } else {
      setError(null);
    }
  }, [mode]);

  const handleTransfer = useCallback(() => {
    if (mode === 'push') {
      if (!localPath.trim()) {
        setError('Please select a file to push');
        return;
      }
      if (!remotePath.trim()) {
        setError('Please enter a remote path');
        return;
      }
    } else {
      if (!remotePath.trim()) {
        setError('Please enter a remote path to pull');
        return;
      }
    }

    setError(null);
    simulateTransfer();
  }, [mode, localPath, remotePath]);

  const simulateTransfer = () => {
    setIsTransferring(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTransferring(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm text-gray-200">ADB File Transfer</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('push')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'push'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Push
          </button>
          <button
            onClick={() => setMode('pull')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'pull'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pull
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-900 text-red-200 text-sm rounded">
          {error}
        </div>
      )}

      {/* Path Inputs */}
      <div className="p-4 space-y-4">
        {/* Remote Path */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {mode === 'push' ? 'Remote Path (device)' : 'Remote Path (device)'}
          </label>
          <input
            type="text"
            value={remotePath}
            onChange={(e) => setRemotePath(e.target.value)}
            placeholder={mode === 'push' ? '/sdcard/Download/' : '/sdcard/file.txt'}
            className="w-full bg-gray-900 text-gray-200 text-sm px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Local Path (Push mode) or Local Path Display (Pull mode) */}
        {mode === 'push' ? (
          <div
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-3">📤</div>
            <p className="text-gray-300 mb-1">
              {localPath ? localPath : 'Drop file here or enter path below'}
            </p>
            <input
              type="text"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              placeholder="/local/path/to/file"
              className="w-full bg-gray-900 text-gray-200 text-sm px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none m-2"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Local Save Path</label>
            <input
              type="text"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              placeholder="/local/save/path/"
              className="w-full bg-gray-900 text-gray-200 text-sm px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={isTransferring}
          className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTransferring ? 'Transferring...' : mode === 'push' ? 'Push to Device' : 'Pull from Device'}
        </button>
      </div>

      {/* Progress Bar */}
      {isTransferring && (
        <div className="mx-4 mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{mode === 'push' ? 'Pushing...' : 'Pulling...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ADBFileTransfer;
