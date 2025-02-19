import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const blockSchema = z.object({
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
});

type BlockFormValues = z.infer<typeof blockSchema>;

type BlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BlockFormValues) => void;
  initialValues?: Partial<BlockFormValues>;
  mode: "add" | "edit";
};

type BlockCategory = {
  id: number;
  name: string;
};

export function BlockDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode
}: BlockDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const { data: categories = [] } = useQuery<BlockCategory[]>({
    queryKey: ['/api/block-categories'],
  });

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      content: initialValues?.content || "",
      category: initialValues?.category || "",
      tags: initialValues?.tags || "",
    },
  });

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (categories.some(c => c.name === newCategory.trim())) {
      toast({
        title: "Error",
        description: "Category already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/block-categories', { name: newCategory.trim() });
      queryClient.invalidateQueries({ queryKey: ['/api/block-categories'] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setNewCategory("");
      setShowNewCategory(false);
      form.setValue("category", newCategory.trim());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (values: BlockFormValues) => {
    try {
      const blockData = {
        content: values.content,
        category: values.category,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      };

      if (mode === "edit") {
        await onSubmit(values);
      } else {
        await apiRequest('POST', '/api/blocks', blockData);
        queryClient.invalidateQueries({ queryKey: ['/api/blocks'] });
        toast({
          title: "Success",
          description: "Block added successfully",
        });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: mode === "edit" ? "Failed to update block" : "Failed to add block",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Block" : "Edit Block"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter prompt block content..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {!showNewCategory ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowNewCategory(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Category
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddCategory}>
                    Add
                  </Button>
                </div>
              )}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {mode === "add" ? "Add Block" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}