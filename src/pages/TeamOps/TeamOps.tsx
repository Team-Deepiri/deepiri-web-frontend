import { Users } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function TeamOps() {
  return (
    <PagePreview
      icon={Users}
      eyebrow="Team · Administration"
      title="Team Ops"
      description="Manage the people behind the platform — roles, permissions, service ownership, and who to ping when a service degrades. See every team, its members, and the systems they own in one place."
    />
  );
}
