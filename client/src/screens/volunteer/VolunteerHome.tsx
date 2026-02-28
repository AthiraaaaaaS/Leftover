import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Donation } from "@/types";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { HandHeart } from "lucide-react";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { DonationCard } from "@/components/donation-cards/DonationCard";

export default function VolunteerHome() {
  const nav = useNavigate();
  const [list, setList] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = (await api.listDonations({ status: "PENDING" })) as Donation[];
      setList(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <GradientHeader
        title="Volunteer Hub"
        subtitle="Pick up donations and deliver to partner locations (demo flow)."
        right={
          <Button
            className="rounded-xl"
            onClick={() => nav("/volunteer/pickups")}
          >
            <HandHeart className="mr-2 h-4 w-4" />
            Find pickups
          </Button>
        }
      />

      <div className="space-y-2">
        <div className="text-sm font-medium">Available now</div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nothing available right now.
          </div>
        ) : (
          <div className="space-y-3">
            {list.slice(0, 2).map((d) => (
              <DonationCard
                key={d.id}
                d={d}
                onClick={() => nav(`/donations/${d.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
