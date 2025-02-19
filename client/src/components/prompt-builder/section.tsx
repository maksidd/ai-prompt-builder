import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, X, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type SectionProps = {
  content: string;
  category?: string;
  tags?: string[];
  isDraggable?: boolean;
  isTemplate?: boolean;
  index?: number;
  moveSection?: (dragIndex: number, hoverIndex: number) => void;
  onRemove?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function Section({ 
  content, 
  category, 
  tags, 
  isDraggable,
  isTemplate,
  index, 
  moveSection, 
  onRemove,
  onEdit,
  onDelete 
}: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { 
      id: `section-${Math.random()}`, 
      content, 
      category, 
      tags, 
      index,
      isTemplate 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: 'section',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current || !moveSection || typeof index === 'undefined' || item.isTemplate) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y || 0) - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        "relative p-4 bg-card border rounded-lg transition-colors",
        isDragging && "opacity-50",
        !isDraggable && "hover:bg-accent"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="pr-8">{content}</p>
          <div className="flex items-center gap-2 mt-2">
            {category && (
              <Badge variant="secondary">
                {category}
              </Badge>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {onEdit && isTemplate && (
            <button
              onClick={onEdit}
              className="p-1 hover:bg-accent rounded"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && isTemplate && (
            <button
              onClick={onDelete}
              className="p-1 hover:bg-accent rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {onRemove && !isTemplate && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-accent rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}