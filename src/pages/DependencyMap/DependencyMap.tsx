import { Flame } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function DependencyMap() {
  return (
    <PagePreview
      icon={Flame}
      eyebrow="Platform · Architecture"
      title="Dependency Map"
      description="Visualize every service, library, and shared package in the deepiri ecosystem and how they depend on each other. Spot coupling, blast radius, and which teams own which edges before a change ships."
    />
  );
}
