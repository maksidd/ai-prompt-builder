import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Section } from '@/components/prompt-builder/section';
import { BlockDialog } from '@/components/prompt-builder/block-dialog';
import { Rating } from '@/components/ui/rating';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Функция для генерации уникального ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

type BuildingBlock = {
  id: number;
  content: string;
  category: string;
  tags?: string[];
};

type PromptSection = {
  id: string;
  content: string;
  category?: string;
  tags?: string[];
};

type InsertTemplate = {
  title: string;
  content: string;
  rating: number;
  tags: string[];
}

export function PromptBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<PromptSection[]>([]);
  const [preview, setPreview] = useState('');
  const [rating, setRating] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);

  const { data: buildingBlocks = [] } = useQuery<BuildingBlock[]>({
    queryKey: ['/api/blocks'],
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'section',
    drop: (item: { isTemplate: boolean; content: string; category?: string; tags?: string[] }) => {
      if (!item.isTemplate) return;

      const newSection: PromptSection = {
        id: `section-${generateId()}`,
        content: item.content,
        category: item.category,
        tags: item.tags,
      };

      setSections(prev => {
        const updated = [...prev, newSection];
        updatePreview(updated);
        return updated;
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const updatePreview = (newSections: PromptSection[]) => {
    setPreview(newSections.map(s => s.content).join('\n'));
  };

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    setSections(prev => {
      const updated = [...prev];
      const [dragSection] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, dragSection);
      updatePreview(updated);
      return updated;
    });
  };

  const removeSection = (index: number) => {
    setSections(prev => {
      const updated = prev.filter((_, i) => i !== index);
      updatePreview(updated);
      return updated;
    });
  };

  const handleAddBlock = async (values: { content: string; category: string; tags?: string }) => {
    try {
      const newBlock = {
        content: values.content,
        category: values.category,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      };

      await apiRequest('POST', '/api/blocks', newBlock);
      queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
      toast({
        title: "Success",
        description: "Block added successfully",
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add block",
        variant: "destructive",
      });
    }
  };

  const handleEditBlock = async (values: { content: string; category: string; tags?: string }) => {
    if (editingBlock === null) return;

    try {
      const updatedBlock = {
        content: values.content,
        category: values.category,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      };

      await apiRequest('PATCH', `/api/blocks/${editingBlock}`, updatedBlock);
      queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
      toast({
        title: "Success",
        description: "Block updated successfully",
      });
      setEditingBlock(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update block",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (sections.length === 0) {
      toast({
        title: "No content to save",
        description: "Add some sections to your prompt before saving.",
        variant: "destructive",
      });
      return;
    }

    const templateData: InsertTemplate = {
      title: `Template ${new Date().toLocaleDateString()}`,
      content: sections.map(s => s.content).join('\n'),
      rating,
      tags: sections.flatMap(s => s.tags || []),
    };

    try {
      await apiRequest('POST', '/api/templates', templateData);
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Building Blocks</h2>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {buildingBlocks.map((block) => (
                <Section
                  key={block.id}
                  content={block.content}
                  category={block.category}
                  tags={block.tags}
                  isDraggable
                  isTemplate
                  onEdit={() => setEditingBlock(block.id)}
                  onDelete={async () => {
                    try {
                      await apiRequest('DELETE', `/api/blocks/${block.id}`);
                      queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
                      toast({
                        title: "Success",
                        description: "Block deleted successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to delete block",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Prompt</h2>
              <Rating value={rating} onChange={setRating} />
            </div>
            <div
              ref={drop}
              className={`min-h-[200px] border-2 border-dashed rounded-lg p-4 space-y-2 ${
                isOver ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
            >
              {sections.map((section, index) => (
                <Section
                  key={section.id}
                  index={index}
                  content={section.content}
                  category={section.category}
                  tags={section.tags}
                  moveSection={moveSection}
                  onRemove={() => removeSection(index)}
                />
              ))}
              {sections.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Drag sections here to build your prompt
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Preview</h2>
          <Textarea
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            className="min-h-[300px]"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleSaveTemplate}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
          </div>
        </div>
      </Card>

      <BlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddBlock}
        mode="add"
      />

      {editingBlock !== null && (
        <BlockDialog
          open={true}
          onOpenChange={() => setEditingBlock(null)}
          onSubmit={handleEditBlock}
          initialValues={{
            content: buildingBlocks.find(b => b.id === editingBlock)?.content,
            category: buildingBlocks.find(b => b.id === editingBlock)?.category,
            tags: buildingBlocks.find(b => b.id === editingBlock)?.tags?.join(', '),
          }}
          mode="edit"
        />
      )}
    </div>
  );
}