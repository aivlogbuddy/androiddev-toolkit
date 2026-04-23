import { useState } from 'react';
import { unlockStore } from '../../lib/tauri';

export interface MasterPasswordDialogProps {
  onUnlock: () => void;
  onSkip: () => void;
}

interface Props extends MasterPasswordDialogProps {
  isNewUser?: boolean;
}

export function MasterPasswordDialog({ onUnlock, onSkip, isNewUser = false }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('密码长度至少为8个字符');
      return;
    }

    if (isNewUser && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unlockStore(password);
      if (result.success) {
        onUnlock();
      } else {
        setError(result.error || '解锁失败');
      }
    } catch (err) {
      setError('解锁失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isNewUser ? '设置主密码' : '输入主密码'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isNewUser
              ? '设置主密码用于加密保护您的会话数据。密码长度至少为8个字符。'
              : '请输入主密码以解锁会话数据。'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入密码"
                  autoFocus
                />
              </div>

              {isNewUser && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    确认密码
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="再次输入密码"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '验证中...' : isNewUser ? '设置密码' : '解锁'}
                </button>
                {!isNewUser && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    跳过
                  </button>
                )}
              </div>
            </div>
          </form>

          {!isNewUser && (
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <button
                type="button"
                onClick={onSkip}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                设置新密码
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MasterPasswordDialog;