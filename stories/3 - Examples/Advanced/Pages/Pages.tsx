import React, {useState} from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDndContext,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import classNames from 'classnames';

import {createRange} from '../../../utilities';

import {Page, Layout, Position} from './Page';
import type {Props as PageProps} from './Page';
import styles from './Pages.module.css';

interface Props {
  layout: Layout;
}

export function Pages({layout}: Props) {
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(() =>
    createRange<string>(20, (index) => `${index + 1}`)
  );
  const activeIndex = items.indexOf(activeId);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <SortableContext items={items}>
        <ul className={classNames(styles.Pages, styles[layout])}>
          {items.map((id, index) => (
            <SortablePage
              id={id}
              index={index + 1}
              key={id}
              layout={layout}
              activeIndex={activeIndex}
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <PageOverlay id={activeId} layout={layout} items={items} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart({active}: DragStartEvent) {
    setActiveId(active.id);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd({over}) {
    if (over) {
      const overIndex = items.indexOf(over.id);

      if (activeIndex !== overIndex) {
        const newIndex = overIndex;

        setItems((items) => arrayMove(items, activeIndex, newIndex));
      }
    }

    setActiveId(null);
  }
}

function PageOverlay({
  id,
  items,
  ...props
}: Omit<PageProps, 'index'> & {items: string[]}) {
  const {activatorEvent, over} = useDndContext();
  const isKeyboardSorting = activatorEvent instanceof KeyboardEvent;
  const activeIndex = items.indexOf(id);
  const overIndex = items.indexOf(over?.id);

  return (
    <Page
      id={id}
      {...props}
      clone
      insertPosition={
        isKeyboardSorting && overIndex !== activeIndex
          ? overIndex > activeIndex
            ? Position.After
            : Position.Before
          : undefined
      }
    />
  );
}

function SortablePage({
  id,
  activeIndex,
  ...props
}: PageProps & {activeIndex: number}) {
  const {
    attributes,
    listeners,
    index,
    isDragging,
    over,
    setNodeRef,
  } = useSortable({
    id,
  });

  return (
    <Page
      ref={setNodeRef}
      id={id}
      active={isDragging}
      insertPosition={
        over?.id === id
          ? index > activeIndex
            ? Position.After
            : Position.Before
          : undefined
      }
      {...props}
      {...attributes}
      {...listeners}
    />
  );
}
