import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'destructive';
    isLoading?: boolean;
}

const VARIANT_CLASSES = {
    primary: 'bg-accent hover:bg-accent-hover text-accent-foreground',
    secondary: 'bg-transparent border border-border text-foreground/80 hover:bg-surface-inset',
    destructive: 'bg-destructive hover:bg-destructive/90 text-white',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', isLoading, disabled, children, className = '', ...rest }, ref) {
    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-5 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
            {...rest}
        >
            {isLoading && <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {children}
        </button>
    );
});
