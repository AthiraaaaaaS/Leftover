import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Donation, DonationStatus } from "@/types";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { DonationCard } from "@/components/donation-cards/DonationCard";

const statuses: (DonationStatus | "All")[] = [
  "All",
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "CANCELLED",
];

export default function DonorDonations() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [list, setList] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setList((await api.listDonations({ q, status })) as Donation[]);
      setLoading(false);
    })();
  }, [q, status]);

  return (
    <div className="space-y-4">
      <GradientHeader
        title="My Donations"
        subtitle="Track pickup status and delivery updates."
      />

      <Input
        className="rounded-xl"
        placeholder="Search location, category, status..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <Tabs value={status} onValueChange={(v: any) => setStatus(v as any)}>
        <TabsList className="grid grid-cols-3 rounded-xl">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-sm text-muted-foreground">No donations found.</div>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <DonationCard
              key={d.id}
              d={d}
              onClick={() => nav(`/donations/${d.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
