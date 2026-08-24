import type { Item, Category } from '@everly/shared';

interface ItemCardProps {
    item: Item;
    category?: Category;
    onEdit: () => void;
    onArchiveToggle: () => void;
}

export function ItemCard({ item, category, onEdit, onArchiveToggle }: ItemCardProps) {
    const color = category?.color ?? '#6b7280';

    return (
        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col hover:border-muted-foreground/40 transition-colors">
            <button
                type="button"
                onClick={onEdit}
                className="relative aspect-4/3 flex items-center justify-center cursor-pointer overflow-hidden"
                style={
                    item.imageUrl
                        ? undefined
                        : {
                              backgroundImage: `repeating-linear-gradient(135deg, ${color}33 0px, ${color}33 14px, ${color}4d 14px, ${color}4d 28px)`,
                          }
                }
            >
                {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md" style={{ backgroundColor: `${color}48`, color }}>
                    {category?.name ?? 'Uncategorized'}
                </span>
            </button>

            <div className="p-4 flex flex-col gap-2 flex-1">
                <button type="button" onClick={onEdit} className="text-left text-[15px] font-semibold text-foreground cursor-pointer">
                    {item.title}
                </button>

                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={n <= item.importance ? 'text-accent' : 'text-border'} style={{ fontSize: '9px' }}>
                            ●
                        </span>
                    ))}
                </div>

                {item.description && <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.4em]">{item.description}</p>}

                <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-border-subtle">
                    <span className="text-[11.5px] text-muted-foreground">{item.locationLabel ? `📍 ${item.locationLabel}` : new Date(item.createdAt).toLocaleDateString()}</span>
                    <button type="button" onClick={onArchiveToggle} className="text-[11.5px] text-muted-foreground hover:text-foreground hover:bg-surface-inset cursor-pointer px-2 py-1 rounded-md">
                        {item.isArchived ? 'Restore' : 'Mark done'}
                    </button>
                </div>
            </div>
        </div>
    );
}
