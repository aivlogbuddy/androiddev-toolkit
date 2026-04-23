import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface Macro {
  id: string;
  name: string;
  command: string;
}

interface SerialMacroPanelProps {
  connectionId: string;
  macros: Macro[];
  onAddMacro: (macro: Omit<Macro, 'id'>) => void;
  onDeleteMacro: (id: string) => void;
}

// Parse variables from command string using regex: /\{(\w+)\}/g
function parseVariables(command: string): string[] {
  const regex = /\{(\w+)\}/g;
  const matches = command.match(regex);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

// Replace variables in command with their values
function substituteVariables(command: string, variables: Record<string, string>): string {
  return command.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
}

export function SerialMacroPanel({
  connectionId,
  macros,
  onAddMacro,
  onDeleteMacro,
}: SerialMacroPanelProps) {
  const [newName, setNewName] = useState('');
  const [newCommand, setNewCommand] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [editingMacroId, setEditingMacroId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedVariables = editingMacroId
    ? parseVariables(macros.find((m) => m.id === editingMacroId)?.command ?? '')
    : parseVariables(newCommand);

  const handleExecuteMacro = useCallback(
    async (macro: Macro) => {
      setError(null);
      setIsExecuting(true);
      setEditingMacroId(macro.id);

      const finalCommand = substituteVariables(macro.command, variableValues);

      try {
        await invoke('serial_write', { sessionId: connectionId, data: finalCommand });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsExecuting(false);
      }
    },
    [connectionId, variableValues]
  );

  const handleAddMacro = useCallback(() => {
    if (!newName.trim() || !newCommand.trim()) return;

    onAddMacro({
      name: newName.trim(),
      command: newCommand.trim(),
    });

    setNewName('');
    setNewCommand('');
    setVariableValues({});
  }, [newName, newCommand, onAddMacro]);

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-200">Serial Macros</h2>
        <p className="text-xs text-gray-500 mt-1">
          Define commands with {'{variable}'} placeholders
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Macros List */}
      <div className="flex-1 overflow-auto p-4">
        {macros.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            No macros defined. Add one below.
          </div>
        ) : (
          <div className="space-y-3">
            {macros.map((macro) => (
              <div
                key={macro.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">{macro.name}</h3>
                    <p className="text-xs text-green-400 font-mono mt-1">
                      {macro.command}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteMacro(macro.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                {/* Variable inputs for this macro */}
                {parseVariables(macro.command).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {parseVariables(macro.command).map((varName) => (
                      <div key={varName} className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 font-mono w-20">
                          {varName}:
                        </label>
                        <input
                          type="text"
                          value={variableValues[varName] ?? ''}
                          onChange={(e) => handleVariableChange(varName, e.target.value)}
                          className="flex-1 bg-gray-900 text-gray-200 text-xs font-mono px-2 py-1 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
                          placeholder={`Enter ${varName}...`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Execute button */}
                <button
                  onClick={() => handleExecuteMacro(macro)}
                  disabled={isExecuting}
                  className="mt-3 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                >
                  {isExecuting && editingMacroId === macro.id ? 'Executing...' : 'Execute'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Macro Form */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <h3 className="text-xs font-medium text-gray-300 mb-3">Add New Macro</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-900 text-gray-200 text-sm px-3 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
              placeholder="e.g., Send reboot"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Command (use {'{variable}'} for placeholders)
            </label>
            <input
              type="text"
              value={newCommand}
              onChange={(e) => setNewCommand(e.target.value)}
              className="w-full bg-gray-900 text-gray-200 text-sm font-mono px-3 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
              placeholder="e.g., reboot -f {device_id}"
            />
          </div>

          {/* Preview parsed variables */}
          {parsedVariables.length > 0 && (
            <div className="text-xs text-gray-500">
              Detected variables:{' '}
              {parsedVariables.map((v) => (
                <span key={v} className="text-green-400 font-mono">
                  {v}
                </span>
              )).join(', ')}
            </div>
          )}

          <button
            onClick={handleAddMacro}
            disabled={!newName.trim() || !newCommand.trim()}
            className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Macro
          </button>
        </div>
      </div>
    </div>
  );
}

export default SerialMacroPanel;