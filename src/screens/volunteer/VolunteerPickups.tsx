import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Donation } from "@/types";
import { mockApi } from "@/mock/mockApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { DonationCard } from "@/components/donation-cards/DonationCard";
import { demoVolunteer } from "@/lib/sessions";

export default function VolunteerPickups() {
  const nav = useNavigate();
  //   const { toast } = useToast();
  const [q, setQ] = useState("");
  const [list, setList] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setList(await mockApi.listDonations({ q, status: "PENDING" }));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-4">
      <GradientHeader
        title="Pickups"
        subtitle="Only Pending donations show here (demo)."
      />

      <Input
        className="rounded-xl"
        placeholder="Search area/category..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-sm text-muted-foreground">No pickups found.</div>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <div key={d.id} className="space-y-2">
              <DonationCard d={d} onClick={() => nav(`/donations/${d.id}`)} />
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={async () => {
                  try {
                    const { task } = await mockApi.acceptPickup(
                      d.id,
                      demoVolunteer
                    );
                    // toast({
                    //   title: "Pickup accepted",
                    //   description: `Task ${task.id} created.`,
                    // });
                    nav(`/volunteer/tasks`);
                  } catch (e: any) {
                    // toast({
                    //   title: "Couldn’t accept",
                    //   description: e?.message ?? "Try again",
                    //   variant: "destructive",
                    // });
                  }
                }}
              >
                Accept pickup
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
