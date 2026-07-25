import React, { memo } from 'react';

/**
 * A single chat message bubble.
 * Memoised to prevent full-list re-renders when a new message arrives.
 *
 * @param {{ message: object, isOwn: boolean }} props
 */
const MessageBubble = memo(function MessageBubble({ message, isOwn }) {
  const timeFormatted = message.timeStamp
    ? new Date(message.timeStamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-1`}>
      {/* Meta row — sender + timestamp */}
      <span className="text-[11px] text-slate-400 mb-1 px-1 select-none">
        {isOwn ? 'You' : <span className="font-semibold text-slate-300">{message.sender}</span>}
        {timeFormatted && <> · {timeFormatted}</>}
      </span>

      {/* Bubble */}
      <div
        className={`
          max-w-[80%] sm:max-w-md px-4 py-2.5 text-sm leading-relaxed break-words
          ${isOwn
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-none shadow-md shadow-blue-900/30'
            : 'bg-slate-800 text-slate-100 rounded-2xl rounded-bl-none shadow-md shadow-black/20'
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
});

export default MessageBubble;
