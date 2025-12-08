/**
 * AIAssistantModal Component
 * Feature: 001-ai-assistant
 *
 * Modal interface for AI-powered conversational interaction
 */

'use client'

import React, { useRef, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import MessageBubble from '@/components/ui/MessageBubble'
import { useAIAssistant } from '@/lib/hooks/useAIAssistant'
import { Send, Loader2 } from 'lucide-react'

interface AIAssistantModalProps {
  open: boolean
  onClose: () => void
  onItemAdded?: () => void
}

export default function AIAssistantModal({
  open,
  onClose,
  onItemAdded,
}: AIAssistantModalProps) {
  const {
    messages,
    input,
    isStreaming,
    sendMessage,
    setInput,
    clearMessages,
  } = useAIAssistant()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleClose = () => {
    clearMessages()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    sendMessage(e)

    // Call onItemAdded callback after a short delay to allow for item creation
    if (onItemAdded) {
      setTimeout(onItemAdded, 1000)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="AI Assistant" size="lg">
      <div className="flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <div className="space-y-2">
                <p className="text-lg font-medium">How can I help you today?</p>
                <p className="text-sm">
                  Try saying: "I want to watch Dune Part 2" or "What movies do I have saved?"
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {/* Loading indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            Send
          </button>
        </form>
      </div>
    </Modal>
  )
}
