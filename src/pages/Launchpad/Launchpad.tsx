import { Rocket } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function Launchpad() {
  return (
    <PagePreview
      icon={Rocket}
      eyebrow="Repos · Onboarding"
      title="Launchpad"
      description="Provision new repositories, services, and workspaces from templates. Pick a stack, define the team and permissions, and deepiri-scaffold spins up the repo, CI pipeline, and documentation in one pass."
    />
  );
}
