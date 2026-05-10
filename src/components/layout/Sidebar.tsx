import { useState, useRef, useCallback } from 'react';

interface Device {
  id: string;
  name: string;
  type: 'ssh' | 'adb' | 'serial';
  group: string;
}

interface SidebarProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onDeviceSelect: (deviceId: string) => void;
  onAddDevice: () => void;
}

interface DeviceGroupProps {
  title: string;
  icon: string;
  devices: Device[];
  selectedDeviceId: string | null;
  onDeviceSelect: (deviceId: string) => void;
  defaultExpanded?: boolean;
}

function DeviceGroup({ title, icon, devices, selectedDeviceId, onDeviceSelect, defaultExpanded = false }: DeviceGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const typeIcon = {
    ssh: '🖥️',
    adb: '📱',
    serial: '🔌',
  };

  const groupedDevices: Record<string, Device[]> = {};
  devices.forEach(device => {
    if (!groupedDevices[device.group]) {
      groupedDevices[device.group] = [];
    }
    groupedDevices[device.group].push(device);
  });

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded transition-colors"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>{icon}</span>
        <span>{title}</span>
      </button>
      {expanded && (
        <div className="ml-4">
          {Object.entries(groupedDevices).map(([groupName, groupDevices]) => (
            <div key={groupName}>
              <div className="text-[10px] text-gray-500 px-2 py-0.5">{groupName}</div>
              {groupDevices.map(device => (
                <button
                  key={device.id}
                  onClick={() => onDeviceSelect(device.id)}
                  className={`w-full flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    selectedDeviceId === device.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{typeIcon[device.type]}</span>
                  <span className="truncate">{device.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ devices, selectedDeviceId, onDeviceSelect, onAddDevice }: SidebarProps) {
  const [width, setWidth] = useState(180);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(120, Math.min(400, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const sshDevices = devices.filter(d => d.type === 'ssh');
  const adbDevices = devices.filter(d => d.type === 'adb');
  const serialDevices = devices.filter(d => d.type === 'serial');

  return (
    <div className="relative h-full flex">
      <div
        ref={sidebarRef}
        className="bg-gray-100 h-full flex flex-col border-r border-gray-300 overflow-hidden"
        style={{ width: `${width}px`, minWidth: `${width}px` }}
      >
        <div className="flex-1 overflow-y-auto py-2">
          <DeviceGroup
            title="SSH"
            icon="🔗"
            devices={sshDevices}
            selectedDeviceId={selectedDeviceId}
            onDeviceSelect={onDeviceSelect}
            defaultExpanded={true}
          />
          <DeviceGroup
            title="ADB"
            icon="📲"
            devices={adbDevices}
            selectedDeviceId={selectedDeviceId}
            onDeviceSelect={onDeviceSelect}
            defaultExpanded={true}
          />
          <DeviceGroup
            title="Serial"
            icon="🔌"
            devices={serialDevices}
            selectedDeviceId={selectedDeviceId}
            onDeviceSelect={onDeviceSelect}
            defaultExpanded={true}
          />
        </div>
        <button
          onClick={onAddDevice}
          className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 border-t border-gray-300 transition-colors text-left"
        >
          + 添加设备
        </button>
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors ${
          isResizing ? 'bg-blue-500' : ''
        }`}
      />
    </div>
  );
}