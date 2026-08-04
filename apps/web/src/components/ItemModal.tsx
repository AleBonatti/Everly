import { useRef, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createItemInputSchema, type CreateItemInput, type Item, type Category } from '@everly/shared';
import { ApiError } from '../lib/api-client';
import { useUploadItemImage } from '../hooks/useItems';
import { LocationPicker } from './LocationPicker';
import { TextField } from './TextField';
import { Button } from './Button';

interface ItemModalProps {
    item?: Item;
    categories: Category[];
    onClose: () => void;
    onSubmit: (input: CreateItemInput) => void;
    onDelete?: () => void;
    isSubmitting: boolean;
    error: string;
}

export function ItemModal({ item, categories, onClose, onSubmit, onDelete, isSubmitting, error }: ItemModalProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateItemInput>({
        resolver: zodResolver(createItemInputSchema),
        defaultValues: {
            title: item?.title ?? '',
            description: item?.description ?? '',
            notes: item?.notes ?? '',
            categoryId: item?.categoryId ?? categories[0]?.id ?? '',
            importance: item?.importance ?? 3,
            locationLabel: item?.locationLabel ?? '',
            latitude: item?.latitude ?? undefined,
            longitude: item?.longitude ?? undefined,
        },
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState('');
    const uploadImage = useUploadItemImage();

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const selectedCategoryId = watch('categoryId');
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
    const latitude = watch('latitude');
    const longitude = watch('longitude');

    function handleLocationChange(lat: number, lng: number) {
        setValue('latitude', lat, { shouldDirty: true });
        setValue('longitude', lng, { shouldDirty: true });
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !item) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setImageError('Only JPEG, PNG, and WebP images are allowed');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setImageError('Image must be smaller than 5MB');
            return;
        }

        setImageError('');
        setPreviewUrl(URL.createObjectURL(file));
        uploadImage.mutate(
            { id: item.id, file },
            {
                onError: (error) => {
                    setImageError(error instanceof ApiError ? error.message : 'Something went wrong');
                },
            },
        );
    }

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div onClick={onClose} className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-start justify-center p-10 z-[100] overflow-auto">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-2xl w-full max-w-[620px] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h2 className="text-lg text-foreground">{item ? 'Edit item' : 'Add a new item'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg px-2 cursor-pointer">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 flex flex-col gap-4.5">
                        {item ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative aspect-[16/7] rounded-lg overflow-hidden border border-dashed border-muted-foreground/40 cursor-pointer"
                                style={{ backgroundColor: `${selectedCategory?.color ?? '#6b7280'}22` }}
                            >
                                {previewUrl || item.imageUrl ? (
                                    <img src={previewUrl ?? item.imageUrl ?? ''} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Click to add photo</span>
                                )}
                                {uploadImage.isPending && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">Uploading...</span>}
                            </button>
                        ) : (
                            <div className="aspect-[16/7] rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/40 bg-surface-inset">
                                <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase text-center px-4">Save the item first to add a photo</span>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                        {imageError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{imageError}</div>}

                        <TextField label="Title" placeholder="e.g. Try the tasting menu at Lumen" {...register('title')} error={errors.title?.message} />

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="item-description" className="text-xs font-semibold text-muted-foreground">
                                Description
                            </label>
                            <textarea
                                id="item-description"
                                rows={3}
                                placeholder="Why is this worth doing?"
                                {...register('description')}
                                className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none resize-y"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="item-notes" className="text-xs font-semibold text-muted-foreground">
                                Notes
                            </label>
                            <textarea
                                id="item-notes"
                                rows={3}
                                placeholder="Any personal notes — e.g. add these once you've done it"
                                {...register('notes')}
                                className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none resize-y"
                            />
                        </div>

                        <div className="flex gap-6 flex-wrap">
                            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
                                <legend className="text-xs font-semibold text-muted-foreground px-0">Category</legend>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex gap-1.5 flex-wrap">
                                            {categories.map((category) => {
                                                const active = field.value === category.id;
                                                return (
                                                    <button
                                                        key={category.id}
                                                        type="button"
                                                        onClick={() => field.onChange(category.id)}
                                                        className="text-xs px-3 py-1.5 rounded-md cursor-pointer border"
                                                        style={{
                                                            backgroundColor: active ? `${category.color}33` : 'var(--color-surface-inset)',
                                                            color: active ? category.color : 'var(--color-muted-foreground)',
                                                            borderColor: active ? category.color : 'var(--color-border)',
                                                        }}
                                                    >
                                                        {category.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                            </fieldset>

                            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
                                <legend className="text-xs font-semibold text-muted-foreground px-0">Importance</legend>
                                <Controller
                                    name="importance"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => field.onChange(n)}
                                                    className="cursor-pointer text-lg"
                                                    style={{ color: n <= (field.value ?? 0) ? 'var(--color-accent)' : 'var(--color-border)' }}
                                                >
                                                    ●
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                            </fieldset>
                        </div>

                        <LocationPicker latitude={latitude} longitude={longitude} onChange={handleLocationChange} />

                        <TextField label="Location name" placeholder="e.g. Kyoto, Japan" {...register('locationLabel')} error={errors.locationLabel?.message} />

                        {error && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{error}</div>}
                    </div>

                    <div className="flex items-center justify-between px-6 py-4.5 border-t border-border">
                        {item && onDelete ? (
                            <button type="button" onClick={onDelete} className="text-sm text-destructive cursor-pointer px-1.5 py-2">
                                Delete
                            </button>
                        ) : (
                            <div />
                        )}
                        <div className="flex gap-2.5">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSubmitting}>
                                Save item
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
