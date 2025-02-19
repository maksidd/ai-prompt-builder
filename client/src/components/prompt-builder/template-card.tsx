import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { TemplateWithCategory } from "@shared/schema";

type TemplateCardProps = {
  template: TemplateWithCategory;
};

export function TemplateCard({ template }: TemplateCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await apiRequest('DELETE', `/api/templates/${template.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  // Удаляем дубликаты тегов и создаем уникальные ключи
  const uniqueTags = Array.from(new Set(template.tags || []));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{template.title}</h3>
          </div>
          <Rating value={template.rating || 0} readonly />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.content}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {uniqueTags.map((tag) => (
            <Badge key={`${template.id}-${tag}`} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}