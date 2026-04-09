import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 rounded-2xl border-0 bg-white pl-11 shadow-md shadow-black/5 focus-visible:ring-2 focus-visible:ring-primary/30"
          placeholder="Search area or category..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-lg shadow-black/5 ring-1 ring-black/5">
          <span className="mb-4 block text-6xl">🔍</span>
          <p className="text-base font-semibold text-foreground">No pickups found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((d) => (
            <div key={d.id} className="space-y-2">
              <DonationCard d={d} onClick={() => nav(`/donations/${d.id}`)} />
              <Button
                className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20"
                onClick={async () => {
                  try {
                    const user = getCurrentUserSync();
                    if (!user || user.role !== "VOLUNTEER") return;
                    const vol = user.volunteer as { fullName?: string; full_name?: string; phone?: string };
                    const volName = vol?.fullName ?? vol?.full_name ?? user.username;
                    const volPhone = vol?.phone ?? "";
                    await api.acceptPickup(d.id, {
                      id: user.id,
                      name: volName,
                      phoneMasked: maskPhone(volPhone),
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
