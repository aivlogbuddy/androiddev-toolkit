import { Device } from '../../stores/deviceStore';

export interface ADBDeviceCardProps {
  device: Device;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onShell: () => void;
  onLogcat: () => void;
  onEdit: () => void;
}

export function ADBDeviceCard({
  device,
  isConnected,
  onConnect,
  onDisconnect,
  onShell,
  onLogcat,
  onEdit,
}: ADBDeviceCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Device Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <div>
            <h3 className="text-sm font-medium text-gray-200">{device.name}</h3>
            <p className="text-xs text-gray-500">{device.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-500'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Device Details */}
      <div className="mb-3 text-xs text-gray-400">
        <p>Type: ADB</p>
        <p>Group: {device.group || 'Default'}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Connect
          </button>
        )}
        <button
          onClick={onShell}
          disabled={!isConnected}
          className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Shell
        </button>
        <button
          onClick={onLogcat}
          disabled={!isConnected}
          className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Logcat
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default ADBDeviceCard;
