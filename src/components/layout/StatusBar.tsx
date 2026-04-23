interface StatusBarProps {
  connectedCount: number;
  totalCount: number;
  cpuPercent: number;
  memoryMB: number;
}

export default function StatusBar({ connectedCount, totalCount, cpuPercent, memoryMB }: StatusBarProps) {
  return (
    <div className="h-6 bg-gray-800 border-t border-gray-700 flex items-center px-3 text-[10px] text-gray-400 gap-4">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span>连接: {connectedCount}/{totalCount}</span>
      </div>
      <div>CPU: {cpuPercent}%</div>
      <div>内存: {memoryMB}MB</div>
    </div>
  );
}
