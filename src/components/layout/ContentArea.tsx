interface ContentAreaProps {
  activeTabTitle?: string;
}

export default function ContentArea({ activeTabTitle }: ContentAreaProps) {
  if (!activeTabTitle) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <div className="text-lg">选择设备开始</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 text-white p-4 overflow-auto">
      <div className="text-sm text-gray-400 mb-2">当前标签: {activeTabTitle}</div>
      <div className="bg-gray-800 rounded-lg p-4 min-h-[200px]">
        {/* Placeholder content - will be replaced with actual tab content */}
        <div className="text-gray-500 text-center py-8">
          内容区域 - 将在后续实现具体功能
        </div>
      </div>
    </div>
  );
}
