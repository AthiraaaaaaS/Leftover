import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/mock/mockApi";
import type { Donation, Task } from "@/types";
import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/components/ui/use-toast";
import { demoVolunteer } from "@/lib/sessions";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";

export default function VolunteerTasks() {
  const nav = useNavigate();
  //   const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [donationsById, setDonationsById] = useState<Record<string, Donation>>(
    {}
  );

  async function load() {
    const t = await mockApi.listTasks(demoVolunteer.id);
    setTasks(t);

    // load donation details for visible tasks
    const map: Record<string, Donation> = {};
    for (const task of t.slice(0, 10)) {
      const d = await mockApi.getDonation(task.donationId);
      if (d) map[d.id] = d;
    }
    setDonationsById(map);
  }

  useEffect(() => {
    load();
  }, []);

  const active = useMemo(
    () => tasks.filter((t) => t.step !== "DELIVERED"),
    [tasks]
  );
  const done = useMemo(
    () => tasks.filter((t) => t.step === "DELIVERED"),
    [tasks]
  );

  return (
    <div className="space-y-4">
      <GradientHeader
        title="My Tasks"
        subtitle="Advance steps: Ready → Started → Picked up → Delivered"
      />

      <div className="space-y-3">
        {(active.length ? active : done).map((t) => {
          const d = donationsById[t.donationId];
          const title = d
            ? `${d.category} • ${d.pickupLocation.label}`
            : t.donationId;

          return (
            <Card key={t.id} className="bg-card/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">
                      Task {t.id} • Updated{" "}
                      {new Date(t.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="secondary">{t.step}</Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => nav(`/volunteer/tasks/${t.id}/checklist`)}
                  >
                    Checklist
                  </Button>
                  <Button
                    className="rounded-xl flex-1"
                    disabled={t.step === "DELIVERED"}
                    onClick={async () => {
                      try {
                        await mockApi.advanceTask(t.id);
                        // toast({
                        //   title: "Updated",
                        //   description: "Task advanced to next step.",
                        // });
                        load();
                      } catch (e: any) {
                        // toast({
                        //   title: "Couldn’t update",
                        //   description: e?.message ?? "Try again",
                        //   variant: "destructive",
                        // });
                      }
                    }}
                  >
                    Advance step
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No tasks yet. Accept a pickup!
          </div>
        ) : null}
      </div>
    </div>
  );
}
