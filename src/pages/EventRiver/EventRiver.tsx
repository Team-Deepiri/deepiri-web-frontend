import { Waves } from "lucide-react";
import { PagePreview } from "@/components/ui/PagePreview";

export default function EventRiver() {
  return (
    <PagePreview
      icon={Waves}
      eyebrow="Platform · Realtime"
      title="Event River"
      description="A live stream of platform events — deployments, service health changes, job lifecycle updates, and user activity flowing through deepiri-realtime. Search, filter by source, and jump straight from an event into the service or repo it belongs to."
    />
  );
}
