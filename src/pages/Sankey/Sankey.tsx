import { GitBranch } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function Sankey() {
  return (
    <PagePreview
      icon={GitBranch}
      eyebrow="Platform · Traffic"
      title="Traffic Flow"
      description="How requests move through the platform — from the api-gateway into each service and on to its dependencies. See volume by edge, spot hotspots, and understand the real path a request takes end to end."
    />
  );
}
