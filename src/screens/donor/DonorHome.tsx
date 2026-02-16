import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/mock/mockApi";
import type { Donation } from "@/types";

import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { DonationCard } from "@/components/donation-cards/DonationCard";

export default function DonorHome() {
  const nav = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await mockApi.listDonations();
      setDonations(data);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const active = donations.filter((d) =>
      ["PENDING", "ASSIGNED", "PICKED_UP"].includes(d.status)
    ).length;
    const delivered = donations.filter((d) => d.status === "DELIVERED").length;
    return { active, delivered };
  }, [donations]);

  return (
    <div className="space-y-4">
      <GradientHeader
        title="Donor Dashboard"
        subtitle="Post a donation in under a minute — volunteers will pick it up."
        right={
          <Button onClick={() => nav("/donor/create")} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card/60 p-4">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="mt-1 text-2xl font-semibold">{stats.active}</div>
        </div>
        <div className="rounded-2xl border bg-card/60 p-4">
          <div className="text-sm text-muted-foreground">Delivered</div>
          <div className="mt-1 text-2xl font-semibold">{stats.delivered}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Recent donations</div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-3">
            {donations.slice(0, 3).map((d) => (
              <DonationCard
                key={d.id}
                d={d}
                onClick={() => nav(`/donations/${d.id}`)}
              />
            ))}
            <Button
              variant="secondary"
              className="w-full rounded-xl"
              onClick={() => nav("/donor/donations")}
            >
              View all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
