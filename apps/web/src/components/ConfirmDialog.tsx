import { useEffect } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    isConfirming?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', isConfirming, onConfirm, onCancel }: ConfirmDialogProps) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onCancel();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div onClick={onCancel} className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-5 z-[100]">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4">
                <div>
                    <h2 className="text-lg text-foreground mb-1.5">{title}</h2>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                <div className="flex items-center justify-end gap-2.5">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} isLoading={isConfirming}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
