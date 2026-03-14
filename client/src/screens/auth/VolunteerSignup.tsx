import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VOLUNTEER_ID_TYPES = [
  { value: "DYFI_MEMBER", label: "DYFI / Party member" },
  { value: "NSS_VOLUNTEER", label: "NSS volunteer" },
  { value: "NGO_COORDINATOR", label: "NGO coordinator" },
  { value: "PARTY_MEMBER", label: "Party member" },
  { value: "OTHER", label: "Other (specify in proof)" },
] as const;

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

  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [volunteerIdType, setVolunteerIdType] = useState<string>("");
  const [volunteerIdProofFile, setVolunteerIdProofFile] = useState<File | undefined>();

  return (
    <div className="space-y-4 ">
      <GradientHeader
        title="Volunteer Registration"
        subtitle="Aadhaar and volunteer ID (e.g. DYFI, NSS, NGO) required. Admin will verify before approval."
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

          <div className="pt-2 text-sm font-medium text-amber-600">
            Mandatory verification (Admin will approve after checking)
          </div>
          <Input
            className="rounded-xl"
            placeholder="Aadhaar last 4 digits *"
            value={aadhaarLast4}
            onChange={(e) => setAadhaarLast4(e.target.value)}
            inputMode="numeric"
          />
          <div className="flex items-center gap-2 rounded-xl border bg-background/20 p-3">
            <Checkbox
              checked={aadhaarConsent}
              onCheckedChange={(v) => setAadhaarConsent(!!v)}
            />
            <div className="text-sm">I consent to share Aadhaar for verification</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Volunteer ID type (e.g. DYFI, NSS, NGO) *</div>
            <Select value={volunteerIdType} onValueChange={setVolunteerIdType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select your ID type" />
              </SelectTrigger>
              <SelectContent>
                {VOLUNTEER_ID_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Proof of volunteer ID (ID card / membership) *</div>
            <Input
              className="rounded-xl"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setVolunteerIdProofFile(e.target.files?.[0])}
            />
          </div>

          {err ? <div className="text-sm text-destructive">{err}</div> : null}

          <Button
            className="w-full rounded-xl"
            disabled={
              busy ||
              !username ||
              !password ||
              !fullName ||
              !phone ||
              !aadhaarConsent ||
              !volunteerIdType ||
              !volunteerIdProofFile
            }
            onClick={async () => {
              setErr(null);
              setBusy(true);
              try {
                const result = await api.auth.registerVolunteer({
                  username,
                  password,
                  fullName,
                  phone,
                  city: city || undefined,
                  hasVehicle,
                  aadhaarLast4: aadhaarLast4 || undefined,
                  aadhaarConsent: aadhaarConsent,
                  volunteerIdType,
                  volunteerIdProofFile,
                });
                if (typeof result === "object" && result !== null && "pending" in result && result.pending) {
                  nav("/auth/pending", { state: { message: "Volunteer account submitted for approval. You will be notified by email when an admin approves it. Then sign in with your credentials." } });
                  return;
                }
                nav("/auth/login");
              } catch (e: unknown) {
                setErr((e as Error)?.message ?? "Signup failed");
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
