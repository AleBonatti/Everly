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
export function useAIAssistant(onItemModified?: () => void): UseAIAssistantReturn {
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

        // Parse newline-delimited JSON stream from fullStream
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const part = JSON.parse(line);

              // Handle different stream part types
              if (part.type === 'text-delta') {
                // Streaming text chunk
                assistantMessage.content += part.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                );
              } else if (part.type === 'tool-call') {
                // Tool invocation
                console.log('Tool call:', part.toolName, part.input);
              } else if (part.type === 'tool-result') {
                // Tool execution result
                console.log('Tool result:', part.toolName, part.output);

                // Add tool result message to the chat
                if (part.output?.message) {
                  assistantMessage.content += part.output.message;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  );
                }

                // Notify when items are modified
                if (
                  onItemModified &&
                  (part.toolName === 'addItem' ||
                    part.toolName === 'toggleItem') &&
                  part.output?.success
                ) {
                  onItemModified();
                }
              }
            } catch (e) {
              console.error('Failed to parse stream part:', line, e);
            }
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
    [input, isStreaming, messages, onItemModified]
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
