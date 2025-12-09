/**
 * AIAssistantModal Component
 * Feature: 001-ai-assistant
 *
 * Modal interface for AI-powered conversational interaction
 */

'use client';

import React, { useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import MessageBubble from '@/components/ui/MessageBubble';
import { useAIAssistant } from '@/lib/hooks/useAIAssistant';
import { Send, Loader2 } from 'lucide-react';

interface AIAssistantModalProps {
  open: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

export default function AIAssistantModal({
  open,
  onClose,
  onItemAdded,
}: AIAssistantModalProps) {
  const { messages, input, isStreaming, sendMessage, setInput, clearMessages } =
    useAIAssistant(onItemAdded);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleClose = () => {
    clearMessages();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(e);
  };

  return (
    <Modal open={open} onClose={handleClose} title="AI Assistant" size="lg">
      <div className="flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-secondary">
              <div className="space-y-2">
                <p className="text-lg font-medium">How can I help you today?</p>
                <p className="text-sm">
                  Try saying: &quot;I want to watch Dune Part 2&quot; or
                  &quot;What movies do I have saved?&quot;
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
            <div className="flex items-center gap-2 text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            style={{ backgroundColor: 'rgb(var(--accent))' }}
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
  );
}
