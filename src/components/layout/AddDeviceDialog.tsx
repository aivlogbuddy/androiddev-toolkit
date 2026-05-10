import { useState } from 'react';
import { useDeviceStore, Device } from '../../stores/deviceStore';

interface AddDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeviceType = 'ssh' | 'adb' | 'serial';

export function AddDeviceDialog({ isOpen, onClose }: AddDeviceDialogProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('ssh');
  const [name, setName] = useState('');
  const addDevice = useDeviceStore((state) => state.addDevice);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDevice: Device = {
      id: `${deviceType}-${Date.now()}`,
      name: name.trim(),
      type: deviceType,
      group: deviceType === 'ssh' ? 'SSH' : deviceType === 'adb' ? 'ADB' : 'Serial',
      connected: false,
    };

    addDevice(newDevice);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">添加设备</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">设备类型</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeviceType('ssh')}
                className={`flex-1 py-2 px-3 rounded text-sm ${
                  deviceType === 'ssh' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                SSH
              </button>
              <button
                type="button"
                onClick={() => setDeviceType('adb')}
                className={`flex-1 py-2 px-3 rounded text-sm ${
                  deviceType === 'adb' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ADB
              </button>
              <button
                type="button"
                onClick={() => setDeviceType('serial')}
                className={`flex-1 py-2 px-3 rounded text-sm ${
                  deviceType === 'serial' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Serial
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">设备名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`例如: My ${deviceType.toUpperCase()} Device`}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDeviceDialog;