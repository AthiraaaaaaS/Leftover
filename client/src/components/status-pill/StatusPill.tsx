import { Badge } from "@/components/ui/badge";
import type { DonationStatus } from "@/types";

const map: Record<
  DonationStatus,
  {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Pending", variant: "outline" },
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  PICKED_UP: { label: "Picked up", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function StatusPill({ status }: { status: DonationStatus }) {
  const m = map[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
