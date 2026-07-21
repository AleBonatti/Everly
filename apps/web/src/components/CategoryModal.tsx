import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CATEGORY_COLORS, createCategoryInputSchema, type CreateCategoryInput, type Category } from '@everly/shared';
import { TextField } from './TextField';
import { Button } from './Button';

interface CategoryModalProps {
    category?: Category;
    onClose: () => void;
    onSubmit: (input: CreateCategoryInput) => void;
    isSubmitting: boolean;
    error: string;
}

export function CategoryModal({ category, onClose, onSubmit, isSubmitting, error }: CategoryModalProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<CreateCategoryInput>({
        resolver: zodResolver(createCategoryInputSchema),
        defaultValues: {
            name: category?.name ?? '',
            color: category?.color ?? CATEGORY_COLORS[0].value,
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const selectedColor = watch('color');

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div onClick={onClose} className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-start justify-center p-10 z-[100] overflow-auto">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-2xl w-full max-w-[420px] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h2 className="text-lg text-foreground">{category ? 'Edit category' : 'Add category'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg px-2 cursor-pointer">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 flex flex-col gap-4.5">
                        <TextField label="Name" placeholder="e.g. Restaurants" {...register('name')} error={errors.name?.message} />

                        <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
                            <legend className="text-xs font-semibold text-muted-foreground px-0">Color</legend>
                            <Controller
                                name="color"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex gap-2 flex-wrap">
                                        {CATEGORY_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => field.onChange(color.value)}
                                                title={color.label}
                                                className="w-7 h-7 rounded-lg cursor-pointer"
                                                style={{
                                                    backgroundColor: color.value,
                                                    border: field.value === color.value ? '2px solid var(--color-foreground)' : '2px solid transparent',
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            />
                        </fieldset>

                        <div className="text-[11px] uppercase tracking-wide font-semibold px-2.5 py-1.5 rounded-md self-start" style={{ backgroundColor: `${selectedColor}33`, color: selectedColor }}>
                            {watch('name') || 'Preview'}
                        </div>

                        {error && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{error}</div>}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 px-6 py-4.5 border-t border-border">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Save category
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
