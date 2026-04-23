import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'connection' | 'shortcuts';

const shortcuts = [
  { keys: 'Ctrl+Shift+T', description: '新标签页' },
  { keys: 'Ctrl+Shift+W', description: '关闭标签' },
  { keys: 'Ctrl+Shift+S', description: '打开设置' },
  { keys: 'Ctrl+F', description: '添加过滤器' },
  { keys: 'Ctrl+L', description: '清除日志' },
  { keys: 'Ctrl+P', description: '暂停/恢复日志' },
];

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const {
    theme,
    logSavePath,
    logFileNameFormat,
    clipboardSync,
    autoReconnect,
    reconnectInterval,
    reconnectMaxRetries,
    setTheme,
    setLogSavePath,
    setLogFileNameFormat,
    setClipboardSync,
    setAutoReconnect,
    setReconnectInterval,
    setReconnectMaxRetries,
  } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 flex overflow-hidden" style={{ maxHeight: '80vh' }}>
        {/* Sidebar */}
        <div className="w-48 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
            设置
          </div>
          <nav className="flex-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full px-4 py-3 text-left text-sm ${
                activeTab === 'general'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              通用
            </button>
            <button
              onClick={() => setActiveTab('connection')}
              className={`w-full px-4 py-3 text-left text-sm ${
                activeTab === 'connection'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              连接
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`w-full px-4 py-3 text-left text-sm ${
                activeTab === 'shortcuts'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              快捷键
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === 'general' && '通用设置'}
                {activeTab === 'connection' && '连接设置'}
                {activeTab === 'shortcuts' && '快捷键'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    主题
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">浅色</option>
                    <option value="dark">深色</option>
                  </select>
                </div>

                {/* Log Save Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    日志保存路径
                  </label>
                  <input
                    type="text"
                    value={logSavePath}
                    onChange={(e) => setLogSavePath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="默认: 当前目录"
                  />
                </div>

                {/* Log File Name Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    日志文件名格式
                  </label>
                  <input
                    type="text"
                    value={logFileNameFormat}
                    onChange={(e) => setLogFileNameFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="device_log_%Y%m%d_%H%M%S.txt"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    支持变量: %Y (年), %m (月), %d (日), %H (时), %M (分), %S (秒)
                  </p>
                </div>
              </div>
            )}

            {/* Connection Tab */}
            {activeTab === 'connection' && (
              <div className="space-y-6">
                {/* Clipboard Sync */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    剪贴板同步
                  </label>
                  <select
                    value={clipboardSync}
                    onChange={(e) => setClipboardSync(e.target.value as 'bidirectional' | 'unidirectional' | 'disabled')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bidirectional">双向同步</option>
                    <option value="unidirectional">单向同步 (设备到电脑)</option>
                    <option value="disabled">禁用</option>
                  </select>
                </div>

                {/* Auto Reconnect */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoReconnect"
                    checked={autoReconnect}
                    onChange={(e) => setAutoReconnect(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoReconnect" className="text-sm text-gray-700 dark:text-gray-300">
                    自动重连
                  </label>
                </div>

                {/* Reconnect Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    重连间隔 (毫秒)
                  </label>
                  <input
                    type="number"
                    value={reconnectInterval}
                    onChange={(e) => setReconnectInterval(Number(e.target.value))}
                    min={1000}
                    max={60000}
                    step={1000}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Reconnect Max Retries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大重连次数
                  </label>
                  <input
                    type="number"
                    value={reconnectMaxRetries}
                    onChange={(e) => setReconnectMaxRetries(Number(e.target.value))}
                    min={0}
                    max={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Shortcuts Tab */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsDialog;