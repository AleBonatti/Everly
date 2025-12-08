/**
 * AIAssistantButton Component
 * Feature: 001-ai-assistant
 *
 * Button to trigger the AI Assistant modal
 */

'use client'

import React from 'react'
import { Bot } from 'lucide-react'

interface AIAssistantButtonProps {
  onClick: () => void
}

export default function AIAssistantButton({ onClick }: AIAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
      aria-label="Open AI Assistant"
    >
      <Bot className="h-4 w-4" />
      <span>AI Assistant</span>
    </button>
  )
}
