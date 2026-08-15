import { Sparkles } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function AIWorkspace() {
  return (
    <PagePreview
      icon={Sparkles}
      eyebrow="AI · Workspace"
      title="AI Workspace"
      description="A shared workspace for the deepiri AI tools — codebase Q&A, PR analysis, and generation helpers all in one place. Ask questions across every repo, get answers grounded in the actual code, and export your sessions."
    />
  );
}
