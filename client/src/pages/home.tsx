import { PromptBuilder } from '@/components/prompt-builder/builder';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Build Your AI Prompt</h1>
        <p className="text-muted-foreground">
          Drag and drop sections to create the perfect prompt for your AI model.
        </p>
      </div>

      <PromptBuilder />
    </div>
  );
}