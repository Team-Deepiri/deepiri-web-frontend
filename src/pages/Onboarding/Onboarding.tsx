import { Compass } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function Onboarding() {
  return (
    <PagePreview
      icon={Compass}
      eyebrow="Team · Getting started"
      title="Start Here"
      description="New to deepiri? This guided tour walks you through the Hub — service health, the event stream, dependency map, and where your team's work shows up. Pick it up in a couple of minutes and get to work."
    />
  );
}
