import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TabBar, { Tab } from './components/layout/TabBar';
import ContentArea from './components/layout/ContentArea';
import StatusBar from './components/layout/StatusBar';
import { SSHTerminal } from './components/ssh/SSHTerminal';
import { SSHFileTransfer } from './components/ssh/SSHFileTransfer';
import { ADBTerminal } from './components/adb/ADBTerminal';
import { ADBLogcat } from './components/adb/ADBLogcat';
import { ADBFileTransfer } from './components/adb/ADBFileTransfer';
import { SerialTerminal } from './components/serial/SerialTerminal';
import { SerialMacroPanel } from './components/serial/SerialMacroPanel';
import { LogViewer } from './components/logviewer/LogViewer';
import { SettingsDialog } from './components/settings/SettingsDialog';
import { MasterPasswordDialog } from './components/settings/MasterPasswordDialog';
import { useDeviceStore } from './stores/deviceStore';
import { useSessionStore } from './stores/sessionStore';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const devices = useDeviceStore((state) => state.devices);
  const selectedDeviceId = useDeviceStore((state) => state.selectedDeviceId);
  const selectDevice = useDeviceStore((state) => state.selectDevice);
  const connectedCount = devices.filter((d) => d.connected).length;

  const sessions = useSessionStore((state) => state.sessions);
  const activeSessionId = useSessionStore((state) => state.activeSessionId);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const handleTabCloseOthers = (tabId: string) => {
    setTabs(tabs.filter((t) => t.id === tabId));
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
    selectDevice(deviceId);
    const existingTab = tabs.find((t) => t.deviceId === deviceId);
    if (!existingTab) {
      const device = devices.find((d) => d.id === deviceId);
      if (device) {
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

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const renderTabContent = (tab: Tab) => {
    if (!tab.deviceId) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <div className="text-lg">选择设备开始</div>
          </div>
        </div>
      );
    }

    const device = devices.find((d) => d.id === tab.deviceId);
    if (!device) return null;

    switch (tab.type) {
      case 'ssh':
        return (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Shell</button>
              <button className="px-3 py-1 bg-gray-700 text-white text-sm rounded">Files</button>
              <button className="px-3 py-1 bg-gray-700 text-white text-sm rounded">Logcat</button>
            </div>
            <SSHTerminal sessionId={`ssh-${device.id}`} deviceId={device.id} onClose={() => handleTabClose(tab.id)} />
          </div>
        );
      case 'adb':
        return (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Shell</button>
              <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded">Logcat</button>
              <button className="px-3 py-1 bg-gray-700 text-white text-sm rounded">Files</button>
            </div>
            <ADBTerminal deviceId={device.id} onClose={() => handleTabClose(tab.id)} />
          </div>
        );
      case 'serial':
        return (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700">
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded">Terminal</button>
              <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded">Macros</button>
            </div>
            <SerialTerminal
              connectionId={`serial-${device.id}`}
              port={device.serialPort || 'COM3'}
              baudRate={device.baudRate || 115200}
              onClose={() => handleTabClose(tab.id)}
            />
          </div>
        );
      case 'logcat':
        return <LogViewer deviceId={tab.deviceId} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-lg">未知的标签类型</div>
            </div>
          </div>
        );
    }
  };

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
        <button
          onClick={() => setShowSettings(true)}
          className="px-3 py-1 text-xs text-gray-400 hover:text-white mx-1"
        >
          设置
        </button>
        <button className="px-3 py-1 text-xs text-gray-400 hover:text-white mx-1">
          ☾
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar devices={devices} selectedDeviceId={selectedDeviceId} onDeviceSelect={handleDeviceSelect} />

        {/* Center Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TabBar */}
          {tabs.length > 0 && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabSelect={setActiveTabId}
              onTabClose={handleTabClose}
              onTabCloseOthers={handleTabCloseOthers}
              onTabCloseAll={handleTabCloseAll}
              onAddTab={handleAddTab}
            />
          )}

          {/* Content Area */}
          <ContentArea>{activeTab ? renderTabContent(activeTab) : null}</ContentArea>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar connectedCount={connectedCount} totalCount={devices.length} cpuPercent={0} memoryMB={0} />

      {/* Settings Dialog */}
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Master Password Dialog */}
      {showMasterPassword && !isUnlocked && (
        <MasterPasswordDialog onUnlock={() => setIsUnlocked(true)} onSkip={() => setShowMasterPassword(false)} />
      )}
    </div>
  );
}

export default App;