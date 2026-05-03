import { ReactNode } from 'react';

interface ContentAreaProps {
  children?: ReactNode;
}

export default function ContentArea({ children }: ContentAreaProps) {
  if (!children) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <div className="text-lg">选择设备开始</div>
        </div>
      </div>
    );
  }

  return <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">{children}</div>;
}