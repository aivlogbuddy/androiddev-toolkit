import { Device } from '../../stores/deviceStore';

export interface SSHSessionCardProps {
  device: Device;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SSHSessionCard({
  device,
  isConnected,
  onConnect,
  onDisconnect,
  onEdit,
  onDelete,
}: SSHSessionCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Device Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖥️</span>
          <div>
            <h3 className="text-sm font-medium text-gray-200">{device.name}</h3>
            <p className="text-xs text-gray-500">
              {device.host || 'No host'}:{device.port || 22}
            </p>
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

      {/* Connection Details */}
      <div className="mb-3 text-xs text-gray-400">
        <p>User: {device.username || 'Not set'}</p>
        <p>Auth: {device.authMethod || 'password'}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Connect
          </button>
        )}
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default SSHSessionCard;
