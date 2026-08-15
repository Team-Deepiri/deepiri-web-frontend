import { Activity } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function Pulse() {
  return (
    <PagePreview
      icon={Activity}
      eyebrow="Platform · Observability"
      title="Platform Pulse"
      description="A rolling health dashboard for the whole platform — latency, error rates, throughput, and uptime across every service. Drill from a summary tile into per-service graphs, then to the runbook or repo that fixes it."
    />
  );
}
