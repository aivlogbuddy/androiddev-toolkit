import { useState, useCallback } from 'react';

export interface FileTransferProps {
  sessionId: string;
  mode: 'upload' | 'download';
}

export function SSHFileTransfer({ sessionId, mode: initialMode }: FileTransferProps) {
  const [mode, setMode] = useState<'upload' | 'download'>(initialMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

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

    if (mode === 'upload') {
      // Placeholder: actual upload logic in Task 12
      simulateTransfer();
    } else {
      // Placeholder: actual download logic in Task 12
      simulateTransfer();
    }
  }, [mode]);

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
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm text-gray-200">File Transfer</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setMode('download')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'download'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Download
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-900 text-red-200 text-sm rounded">
          {error}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`flex-1 m-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-3">{mode === 'upload' ? '📤' : '📥'}</div>
        <p className="text-gray-300 mb-1">
          {mode === 'upload' ? 'Drop files to upload' : 'Click to download'}
        </p>
        <p className="text-gray-500 text-xs">
          {mode === 'upload'
            ? 'Drag & drop files onto this area'
            : 'File download functionality (Task 12)'}
        </p>
      </div>

      {/* Progress Bar */}
      {isTransferring && (
        <div className="mx-4 mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{mode === 'upload' ? 'Uploading...' : 'Downloading...'}</span>
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

export default SSHFileTransfer;
