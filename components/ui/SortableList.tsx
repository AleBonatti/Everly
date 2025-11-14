'use client'

/**
 * SortableList Component
 *
 * A reusable drag-and-drop sortable list component using @dnd-kit.
 * Supports vertical sorting with smooth animations.
 */

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

export interface SortableListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  getItemId: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  className?: string
}

export function SortableList<T>({
  items,
  onReorder,
  getItemId,
  renderItem,
  className = '',
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id)
      const newIndex = items.findIndex((item) => getItemId(item) === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => getItemId(item))}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <React.Fragment key={getItemId(item)}>
              {renderItem(item)}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
