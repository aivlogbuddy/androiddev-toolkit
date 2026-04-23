import { useState, useRef, useEffect } from 'react';

export interface Tab {
  id: string;
  title: string;
  type: 'ssh' | 'adb' | 'serial' | 'shell' | 'files' | 'logcat' | 'info';
  deviceId?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabCloseOthers: (tabId: string) => void;
  onTabCloseAll: () => void;
  onAddTab: () => void;
}

const tabIcons: Record<Tab['type'], string> = {
  ssh: '🖥️',
  adb: '📱',
  serial: '🔌',
  shell: '📋',
  files: '📁',
  logcat: '📜',
  info: 'ℹ️',
};

export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabCloseOthers,
  onTabCloseAll,
  onAddTab,
}: TabBarProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      onTabClose(tabId);
    }
  };

  return (
    <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-1 gap-0.5 overflow-x-auto">
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-t cursor-pointer select-none transition-colors min-w-fit ${
              activeTabId === tab.id
                ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => onTabSelect(tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
          >
            <span>{tabIcons[tab.type]}</span>
            <span className="whitespace-nowrap">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-1 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-400 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAddTab}
        className="ml-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
      >
        +
      </button>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              onTabClose(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-1 text-xs text-gray-200 hover:bg-gray-700 text-left"
          >
            关闭
          </button>
          <button
            onClick={() => {
              onTabCloseOthers(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-1 text-xs text-gray-200 hover:bg-gray-700 text-left"
          >
            关闭其他
          </button>
          <button
            onClick={() => {
              onTabCloseAll();
              setContextMenu(null);
            }}
            className="w-full px-4 py-1 text-xs text-gray-200 hover:bg-gray-700 text-left"
          >
            关闭所有
          </button>
        </div>
      )}
    </div>
  );
}
