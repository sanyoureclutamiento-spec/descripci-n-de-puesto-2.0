import React from 'react';

interface BotMessageProps {
  message: string;
  type?: 'info' | 'warning' | 'success';
  onClose?: () => void;
}

export const BotMessage: React.FC<BotMessageProps> = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const bgColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const icons = {
    info: '🤖',
    warning: '⚠️',
    success: '✅',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-sm mb-4 animate-fadeIn ${bgColors[type]}`}>
      <span className="text-2xl">{icons[type]}</span>
      <div className="flex-1">
        <p className="font-medium mb-1">Asistente de Plan Organizacional</p>
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      )}
    </div>
  );
};