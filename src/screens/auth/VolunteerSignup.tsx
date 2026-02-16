import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { mockApi } from "@/mock/mockApi";

export default function VolunteerSignup() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);

  return (
    <div className="space-y-4 ">
      <GradientHeader
        title="Volunteer Registration"
        subtitle="Create a volunteer account (demo)"
      />

      <Card className="bg-card/60">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-medium">Login credentials</div>
          <Input
            className="rounded-xl"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            className="rounded-xl"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2 text-sm font-medium">Volunteer details</div>
          <Input
            className="rounded-xl"
            placeholder="full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            className="rounded-xl"
            placeholder="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            className="rounded-xl"
            placeholder="city (optional)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <div className="flex items-center gap-2 rounded-xl border bg-background/20 p-3">
            <Checkbox
              checked={hasVehicle}
              onCheckedChange={(v) => setHasVehicle(!!v)}
            />
            <div className="text-sm">I have a vehicle (bike/car)</div>
          </div>

          {err ? <div className="text-sm text-destructive">{err}</div> : null}

          <Button
            className="w-full rounded-xl"
            disabled={busy}
            onClick={async () => {
              setErr(null);
              setBusy(true);
              try {
                await mockApi.auth.registerVolunteer({
                  username,
                  password,
                  fullName,
                  phone,
                  city: city || undefined,
                  hasVehicle,
                });
                nav("/auth/login");
              } catch (e: any) {
                setErr(e?.message ?? "Signup failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Creating..." : "Create Volunteer Account"}
          </Button>

          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() => nav("/auth")}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
