import { useQuery } from "@tanstack/react-query";
import { TemplateCard } from "@/components/prompt-builder/template-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TemplateWithCategory } from "@shared/schema";

export default function Templates() {
  const { data: templates, isLoading } = useQuery<TemplateWithCategory[]>({
    queryKey: ["/api/templates"],
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Templates</h1>
        <p className="text-muted-foreground">
          Browse and manage your saved prompt templates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : templates?.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}