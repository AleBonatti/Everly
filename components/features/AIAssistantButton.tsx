/**
 * AIAssistantButton Component
 * Feature: 001-ai-assistant
 *
 * Button to trigger the AI Assistant modal
 */

'use client';

import React from 'react';
import { Bot } from 'lucide-react';

interface AIAssistantButtonProps {
  onClick: () => void;
}

export default function AIAssistantButton({ onClick }: AIAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex text-sm items-center gap-2 px-4 py-1 rounded-lg bg-accent text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all"
      style={{ backgroundColor: 'rgb(var(--accent))' }}
      aria-label="Open AI Assistant"
    >
      <Bot className="h-4 w-4" />
      <span>AI Assistant</span>
    </button>
  );
}
