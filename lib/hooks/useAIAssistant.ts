/**
 * useAIAssistant Hook
 * Feature: 001-ai-assistant
 *
 * Custom hook for managing AI assistant conversation state and streaming
 */

import { useChat } from 'ai/react';
import type { UseAIAssistantReturn } from '@/types/ai';

/**
 * Hook for managing AI assistant conversation
 * Provides state and methods for chat interaction
 */
export function useAIAssistant(): UseAIAssistantReturn {
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    setMessages,
  } = useChat({
    api: '/api/ai/chat',
    onError: (error) => {
      console.error('AI Chat error:', error);
    },
  });

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    input,
    isStreaming: isLoading,
    sendMessage: handleSubmit,
    setInput: (value: string) =>
      handleInputChange({ target: { value } } as any),
    clearMessages,
  };
}
