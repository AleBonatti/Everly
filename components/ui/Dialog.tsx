'use client'

import React from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import Button from './Button'

export interface DialogProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  description?: string
  type?: 'info' | 'warning' | 'success' | 'error'
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  children?: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  children,
}) => {
  const icons = {
    info: <Info className="h-6 w-6 text-primary-500 dark:text-primary-400" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
    success: <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />,
    error: <XCircle className="h-6 w-6 text-red-500 dark:text-red-400" />,
  }

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm dark:bg-neutral-950/80"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby={description ? 'dialog-description' : undefined}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0" aria-hidden="true">
                  {icons[type]}
                </div>
                <div className="flex-1">
                  <h2
                    id="dialog-title"
                    className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p
                      id="dialog-description"
                      className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
                    >
                      {description}
                    </p>
                  )}
                  {children && <div className="mt-4">{children}</div>}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  {cancelText}
                </Button>
                {onConfirm && (
                  <Button variant={confirmVariant} onClick={handleConfirm}>
                    {confirmText}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

Dialog.displayName = 'Dialog'

export default Dialog
