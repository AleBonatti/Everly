/**
 * useAIAssistant Hook
 * Feature: 001-ai-assistant
 *
 * Custom hook for managing AI assistant conversation state and streaming
 */

import { useState, useCallback } from 'react';
import type { Message } from '@/types/ai';
import type { UseAIAssistantReturn } from '@/types/ai';

/**
 * Hook for managing AI assistant conversation
 * Provides state and methods for chat interaction
 */
export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || isStreaming) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
        timestamp: new Date(),
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsStreaming(true);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        // Add empty assistant message
        setMessages((prev) => [...prev, assistantMessage]);

        // Read the stream - toTextStreamResponse() sends plain text chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Add chunk directly to message content
          if (chunk) {
            assistantMessage.content += chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...assistantMessage }
                  : msg
              )
            );
          }
        }
      } catch (error) {
        console.error('AI Chat error:', error);

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsStreaming(false);
      }
    },
    [input, isStreaming, messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleSetInput = useCallback((value: string) => {
    setInput(value);
  }, []);

  return {
    messages,
    input,
    isStreaming,
    sendMessage,
    setInput: handleSetInput,
    clearMessages,
  };
}
