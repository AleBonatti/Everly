import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, error, id, ...inputProps }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className="flex flex-col gap-1.5">
            <label id="{inputId}" className="text-xs font-semibold text-muted-foreground">
                {label}
            </label>
            <input ref={ref} id={inputId} {...inputProps} className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none" />
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
});
