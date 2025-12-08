/**
 * MessageBubble Component
 * Feature: 001-ai-assistant
 *
 * Displays a single message in the chat conversation
 */

import React from 'react'
import type { Message } from '@/types/ai'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isError = message.error

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'text-white'
            : isError
            ? 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-200'
            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
        }`}
        style={isUser ? { backgroundColor: 'rgb(var(--accent))' } : undefined}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Display tool invocations if present */}
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-current/20 pt-3">
            {message.toolInvocations.map((invocation) => (
              <div key={invocation.toolCallId} className="text-sm opacity-80">
                {invocation.result && (
                  <>
                    {invocation.result.success ? (
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>{invocation.result.message}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">✗</span>
                        <span>{invocation.result.message}</span>
                      </div>
                    )}

                    {/* Display list of items if present */}
                    {invocation.toolName === 'listItems' &&
                     invocation.result.data?.items &&
                     invocation.result.data.items.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-6">
                        {invocation.result.data.items.map((item: any) => (
                          <li key={item.id} className="list-disc">
                            <span className="font-medium">{item.title}</span>
                            {item.location && (
                              <span className="text-xs ml-2">({item.location})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 text-xs opacity-60">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
