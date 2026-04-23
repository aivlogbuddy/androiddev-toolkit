import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TabBar, { Tab } from './components/layout/TabBar';
import ContentArea from './components/layout/ContentArea';
import StatusBar from './components/layout/StatusBar';

interface Device {
  id: string;
  name: string;
  type: 'ssh' | 'adb' | 'serial';
  group: string;
}

// Mock devices as specified
const mockDevices: Device[] = [
  { id: 'dev-server', name: 'dev-server', type: 'ssh', group: '服务器组' },
  { id: 'device-001', name: 'device-001', type: 'adb', group: '测试组' },
  { id: 'COM3', name: 'COM3', type: 'serial', group: '模块A' },
];

// Mock status
const mockConnectedCount = 3;
const mockTotalCount = 5;
const mockCpuPercent = 12;
const mockMemoryMB = 45;

function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: 'Shell', type: 'shell' },
    { id: 'tab-2', title: 'Files', type: 'files' },
    { id: 'tab-3', title: 'Logcat', type: 'logcat' },
    { id: 'tab-4', title: 'Info', type: 'info' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>('tab-1');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const handleTabCloseOthers = (tabId: string) => {
    setTabs(tabs.filter(t => t.id === tabId));
    setActiveTabId(tabId);
  };

  const handleTabCloseAll = () => {
    setTabs([]);
    setActiveTabId(null);
  };

  const handleAddTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: `新标签 ${tabs.length + 1}`,
      type: 'shell',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    // Add a tab for this device if not already present
    const existingTab = tabs.find(t => t.deviceId === deviceId);
    if (!existingTab) {
      const device = mockDevices.find(d => d.id === deviceId);
      if (device) {
        const typeIcon = { ssh: '🖥️', adb: '📱', serial: '🔌' };
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          title: device.name,
          type: device.type,
          deviceId: device.id,
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
      }
    } else {
      setActiveTabId(existingTab.id);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
        <button className="text-gray-400 hover:text-white text-lg">☰</button>
        <span className="font-semibold text-sm">AndroidDev Toolkit</span>
        <div className="flex-1"></div>
        <button className="px-3 py-1 text-xs text-gray-400 hover:text-white bg-gray-700 rounded mx-1">
          搜索
        </button>
        <button className="px-3 py-1 text-xs text-gray-400 hover:text-white mx-1">
          设置
        </button>
        <button className="px-3 py-1 text-xs text-gray-400 hover:text-white mx-1">
          ☾
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          devices={mockDevices}
          selectedDeviceId={selectedDeviceId}
          onDeviceSelect={handleDeviceSelect}
        />

        {/* Center Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TabBar */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={setActiveTabId}
            onTabClose={handleTabClose}
            onTabCloseOthers={handleTabCloseOthers}
            onTabCloseAll={handleTabCloseAll}
            onAddTab={handleAddTab}
          />

          {/* Content Area */}
          <ContentArea activeTabTitle={activeTab?.title} />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        connectedCount={mockConnectedCount}
        totalCount={mockTotalCount}
        cpuPercent={mockCpuPercent}
        memoryMB={mockMemoryMB}
      />
    </div>
  );
}

export default App;
