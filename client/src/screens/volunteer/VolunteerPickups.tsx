import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Donation } from "@/types";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { DonationCard } from "@/components/donation-cards/DonationCard";
import { getCurrentUserSync } from "@/lib/authClient";
import { maskPhone } from "@/lib/utils";

export default function VolunteerPickups() {
  const nav = useNavigate();
  //   const { toast } = useToast();
  const [q, setQ] = useState("");
  const [list, setList] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setList((await api.listDonations({ q, status: "PENDING" })) as Donation[]);
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
                    const user = getCurrentUserSync();
                    if (!user || user.role !== "VOLUNTEER") return;
                    await api.acceptPickup(d.id, {
                      id: user.id,
                      name: user.volunteer.fullName,
                      phoneMasked: maskPhone(user.volunteer.phone),
                    });
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
